// NOTE - Based on doc but modified to fit this project

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

// AI Part for the Document imports
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) throw new Error("Unauthorized");

  // Can get subscription for user and then pass it on in the metadata (hover on "pdfUploader" above) for "onUploadComplete()" since this is run when client upload file.
  const subscriptionPlan = await getUserSubscriptionPlan();

  return { subscriptionPlan, userId: user.id };
};

// This will never be called from any client so can't get user subscription below BUT can for middleware above.
const onUploadComplete = async ({
  metadata,
  file,
}: {
  // Need to declare the types, not inferred by uploadthing
  // metadata type is whatever is return from the "middleware" function above
  metadata: Awaited<ReturnType<typeof middleware>>
  file: {
    // These three types are built inside file from uploadthing & provided so have to make and define its type in here
    key: string
    name: string
    url: string
  },
}) => {

  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key
    }
  })

  // If file exists in database, return and do not go through any of the code below
  if (isFileExist) return

  // Whatever return from middleware '{userId}' will be accessible from the '.onUploadComplete()' as the metadata

  // Callback function via web hook above is trigger after the request

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,

      // file.url times out so can't do so can get image url from AWS S3 which is under the hood for uploadThing
      url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`, // Use this exact url. Will always work unchanged
      uploadStatus: "PROCESSING",
    },
  });
  // When uploading PDF right away, will index it so when asked a question, it's already indexed and can search just for the parts that are similar to the question

  try {
    console.log("In this try block.");
    // Need PDF file here in memory to index it and how many pages it has. Can fetch the URL from a couple lines above, below
    const response = await fetch(
      `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
    );
    console.log("Response: ", response);
    // Need to be a "Blob" object to index it.
    const blob = await response.blob();
    console.log("Blob: ", blob);

    // Load PDF file into memory
    const loader = new PDFLoader(blob);
    console.log("Loader: ", loader);

    // Page Content will be in this document
    const pageLevelDocs = await loader.load();
    console.log("pageLevelDocs: ", pageLevelDocs);

    // Amount of pages
    const pagesAmt = pageLevelDocs.length;

    // To check if user is subscribe for pro plan
    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;
    const isProExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf; // Need the "!" to tell TypeScript that yes, the Pro plan exists and we want the ".pagesPerPdf" from it. If true, then pro limit it exceeded

    const isFreeExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

    // On the pro plan & exceeded the limit or on free plan & exceeded the free limit
    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        // Where we want to update this file?? Where id matches createdFile.id
        where: {
          id: createdFile.id,
        },
      });
    }

    // New Solution - filtering with metadata instead of using namespace
    pageLevelDocs.forEach((doc, i) => {
      doc.metadata = {
        ...doc.metadata,
        fileId: createdFile.id,
      };
      console.log("pageLevelDocs For Each Doc Metadata: ", doc.metadata);
    });

    // Vectorized and index entire document
    // const pinecone = await getPineconecClient()
    const pineconeIndex = pinecone.Index("dekge"); // The main name for the index on Pinecone

    // Uses the OpenAI API to generate embeddings for a given text
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY, // Passed in the OpenAI key from ".env" file
    });

    // Generating the vectors with everything obtained from above
    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      // Can save a vector to a certain namespace
      // When querying a fileId, can get all the vectors for that certain file.
      // namespace: createdFile.id,
    });
    // console.log("PineconeStore: ", doc.metadata);

    // Update file to successful upload state
    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        // Update data where the ID of the file matches the "createdFile.id"
        id: createdFile.id,
      },
    });
    // If there's a problem, then uploadStatus is a failed.
  } catch (error) {
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        // Update data where the ID of the file matches the "createdFile.id"
        id: createdFile.id,
      },
    });
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    // NOTE - Middleware will run when someone/client has requested to upload a file from the client. Chain request and this is middleware so will run & need to add code to make sure user is authenticated to upload
    // Move all the code out of middleware below and created a new function with it so it can easily be reused for "freePlanUploader" and "proPlanUploader"
    .middleware(middleware)
    // This will never be called from any client so can't get user subscription below BUT can for middleware above.
    .onUploadComplete(onUploadComplete),
    // Pro Plan
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
