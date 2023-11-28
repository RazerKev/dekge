// NOTE - Based on doc but modified to fit this project

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

// AI Part for the Document imports
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "@/lib/pinecone";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // NOTE - Middlware will run when someone has requested to upload a file from the client. Chain request and this is middleware so will run & need to add code to make sure user is authenentcated to upload
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = getUser();

      if (!user || !user.id) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Whatever return from middleware '{userId}' will be accessable from the '.onUploadComplete()' as the metadata

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
        // Need PDF file here in memory to index it and how many pages it has. Can fetch the URL from a couple lines above, below
        const response = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        );
        // Need to be a "Blob" object to index it.
        const blob = await response.blob();

        // Load PDF file into memory
        const loader = new PDFLoader(blob);

        // Page Content will be in this document
        const pageLevelDocs = await loader.load();

        // Amount of pages
        const pagesAmt = pageLevelDocs.length;

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
          namespace: createdFile.id,
        });

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
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
