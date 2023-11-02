"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

import Dropzone from "react-dropzone"; // Not destructure anyhything
import { Cloud, File } from "lucide-react";
import { Progress } from "./ui/progress";

const UploadDropzone = () => {
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0)

//   Determinate Progress bar - Don't have access to an actual progress. Can define how it skips (in increments) and once done uploading, can skip to 100. Skip in increment since unsure in whatever percentage of choice but if stuck or not complement by the increment, progress bar will stay at 95% until fully complete.

  const startSimulatedProgress = () => {
    setUploadProgress(0) // Set to 0 for safety initalization

    const interval = setInterval(() => {
      // First arg have access to previous value when using state
      setUploadProgress((prevProgress) => {
        // Don't progress anymore / invalidating whole thing to prevet pass 95%
        if(prevProgress >= 95) {
            clearInterval(interval)
            return prevProgress // Would be 95%
        }
        return prevProgress + 5 // '5' can be any value of increment
      });
    }, 500) // 500ms is set for interval
    return interval
  }

  return (
    <Dropzone
      multiple={false}
      onDrop={(acceptedFiles) => {
        setIsUploading(true)

        const progressInterval = startSimulatedProgress()

        // Hanlde File uploading

        clearInterval(progressInterval) // Resetting after done, clear the interval
        setUploadProgress(100) // Done uploading

        // console.log(acceptedFiles);
      }}
    >
      {/* Followed based on Doc */}
      {/* 'getRootProps()' get props required for dran 'n' drop & use them on any element. 'getInputProps()' use the click and keydown behavior instead. 'acceptedFiles' is when user input the file  */}
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-xl"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop.
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 4MB)</p>
              </div>
              {/* If the file is upload (would be stored in 'acceptedFiles) and at the first index since only checking for one file */}
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-content-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}
              {isUploading ? (
              <div className="w-full mt-4 max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-1 w-full bg-zinc-200" />
              </div>
              ) : null}
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(vissible) => {
        if (!vissible) {
          setIsOpen(vissible);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        {/* 'asChild' makes a custom button as not DialogTrigger inherited. The Button below is main/active*/}
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
