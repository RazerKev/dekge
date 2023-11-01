"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

import Dropzone from "react-dropzone"; // Not destructure anyhything

const UploadDropzone = () => {
  return (
    <Dropzone multiple={false}>
      {/* Based on Doc */}
      {/* 'getRootProps()' get props required for dran 'n' drop & use them on any element. 'getInputProps()' use the click and keydown behavior instead. 'acceptedFiles' is when user input the file  */}
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div {...getRootProps()}></div>
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
