// NOTE - Based on doc but modified to fit this project

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ image: { maxFileSize: "4MB" } })
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
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
