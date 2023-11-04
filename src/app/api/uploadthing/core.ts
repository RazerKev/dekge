// NOTE - Based on doc but modified to fit this project

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // NOTE - Middlware will run when someone has requested to upload a file from the client. Chain request and this is middleware so will run & need to add code to make sure user is authenentcated to upload
    .middleware(async ({ req }) => {

        const {getUser} = getKindeServerSession()
        const user = getUser()

        if(!user || !user.id) throw new Error("Unauthorized")

      return {userId: user.id};
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
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
