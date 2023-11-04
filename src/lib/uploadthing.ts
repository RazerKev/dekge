// Created in 'lib' to prepare a library to be used inside the project 

import { generateReactHelpers } from "@uploadthing/react/hooks";

// import type { OurFileRouter } from "~/app/api/uploadthing/core";

// Syntax error - need to change '~' from above import to '@'
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();