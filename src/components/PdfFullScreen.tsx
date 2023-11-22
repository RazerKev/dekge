import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

interface PdfFullscreenProps {
  fileUrl: string; // always want this property
}

// Don't need to fetch url property since this have access in the PdfRenderer so can pass it in as prop into PdfFullScreen
const PdfFullScreen = ({ fileUrl }: PdfFullscreenProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>();

  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(visibility) => {
        // If invisible, "setIsOpen(visibility)"
        if (!visibility) {
          setIsOpen(visibility);
        }
      }}
    >
      {/* Need a listener for button to go fullscreen */}
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button  
          variant="ghost"
          className="gap-1.5"
          aria-label="fullscreen mode"
        >
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        {/* Need SimpleBar to not let it overflow again and have scroll bars */}
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
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
              // For getting total page #
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              file={fileUrl}
              className="max-h-full"
            >
              {/* Mapping all the pages together into one array */}
              {/* For each number, create one array entry that can be map over but fill them with 0's first and then map them over. Don't care of first value so used "_"(underscore) to ignore but care about index.*/}
              {new Array(numPages).fill(0).map((_, index) => (
                <Page
                  // Do need a key for index
                  key={index}
                  width={width ? width : 1}
                  // Pages start at index 1 but Array starts at index 0 so have to add 1 to match
                  pageNumber={index + 1}
                />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullScreen;
