"use client";

import { Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

// Both imports from react-pdf doc
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";

// Resizes the pdf being uploaded
import { useResizeDetector } from "react-resize-detector";

// WEB WORKER From react-pdf doc but slightly modified. This part manually sets the URL of the worker script from a CDN and do not have to worry about copying or bundling the script yourself (also benefit from caching & performance of CDN). This is for not direct access to build folder or want to use different version of pdf.worker.js.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  // url property received from dynamic fileid route is declared as a string and can be passed in.
  url: string;
}

// '{url}' prop is accessable & can be destructure from the dynamic route of '../app/dashboard/[fileid]/page.tsx'

// PdfRenderProps can be named anything but created interface with this name.
const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* Top bar functionallity (full screen, rotate, zoom etc.) */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">Top Bar</div>
      </div>
      {/* PDF Page Render */}
      <div className="flex-1 w-full max-h-screen">
        {/* This <div> below is important in making the pdf fit the page. The 'ref' is linked to 'useResizeDetector' hook and now get the width saved inside the width constant which can be used to determine the width of the <Page /> below. */}
        <div ref={ref}>
          {/* <Document></Document> is from PDF Library. 'file' is the url that want to be rendered out. */}
          <Document
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
            // Display an error if there's one (have to think of all possible edge cases)
            onLoadError={() => {
              toast({
                title: "Error loading PDF",
                description: " Please try again later",
                variant: "destructive",
              });
            }}
            file={url}
            className="max-h-full"
          >
            {/* If we have the width, use the width, if not, set it to 1. width is obtained from '{ref}' div tag earlier. */}
            <Page width={width ? width : 1} pageNumber={1} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
