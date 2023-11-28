"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

// Both imports from react-pdf doc
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";

// Resizes the pdf being uploaded
import { useResizeDetector } from "react-resize-detector";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

// React Hook Form
import { useForm } from "react-hook-form";
import { z } from "zod";

// To seamlessly integrate external validation library
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Combat Zooming pdf breaking website
import SimpleBar from "simplebar-react";
import PdfFullScreen from "./PdfFullScreen";

// WEB WORKER From react-pdf doc but slightly modified. This part manually sets the URL of the worker script from a CDN and do not have to worry about copying or bundling the script yourself (also benefit from caching & performance of CDN). This is for not direct access to build folder or want to use different version of pdf.worker.js.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  // url property received from dynamic fileid route is declared as a type string and can be passed in.
  url: string;
}

// '{url}' prop is accessible & can be destructure from the dynamic route of '../app/dashboard/[fileid]/page.tsx'

// PdfRenderProps can be named anything but created interface with this name.
const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();

  // State to hold and know the page number of pdf. At first undefined and then once pdf render, total page # can be obtained
  const [numPages, setNumPages] = useState<number>();

  // Keep track of the page currently on (currently set as 1 by default)
  const [currPage, setCurrPage] = useState<number>(1);

  // Scaling PDF Document
  const [scale, setScale] = useState<number>(1);

  // Setting up the rotation of Document
  const [rotation, setRotation] = useState<number>(0);

  // Keeping track of the scale of the page as a number or null
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  // The "isLoading" is derive from renderedScale. If there is a mismatch when changing the scale, then that can be determined that rendering a new page is in progress.
  const isLoading = renderedScale !== scale;

  // Schema Validation Library - Zod installed earlier when installing tRPC
  const CustomPageValidator = z.object({
    // Can name 'page' anything but name makes sense
    // Can't be declared "number" and instead "string" because the input field typed including numbers will be considered a string
    // "refine({})" gives you custom validation logic (Ex. check if number is int or string is valid email address)
    // Convert from string to number that user typed.
    // "num" is the user input
    // "numPages" need "!" at the end to ignore type error and assume 'numPages"  exists
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  // Get the TypeScript type of "CustomPageValidator" and infer it from Zod type and turn it into TypeScript useable for "useForm()" below.
  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  // React hook form.
  // Passing in "<TCustomPageValidator>" so 'useForm()' knows what kind of data it's expecting. Can pass default values
  const {
    register, // make its value available for both the form validation and submission (on doc).
    handleSubmit,
    formState: { errors },
    setValue, // sync input state to current page.
  } = useForm<TCustomPageValidator>({
    // "defaultValues" is from React-hook-form
    defaultValues: {
      page: "1", // 'page' passed in from "CustomPageValidator". Set 1 as default
    },
    // Important - zodResolver let's us connect and link the "useFrom<TCustomPageValidator>()" with the "CustomPageValidator" custom schema on RUNTIME to enfore logic
    // Linking useform validation library to schema valildation library.
    resolver: zodResolver(CustomPageValidator),
  });

  // For pdf resize detector
  const { width, ref } = useResizeDetector();

  // handlePageSubmit handles page submitting logic (only called if passed the custom validator)
  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    // Code below is assuming input is correct
    setValue("page", String(page));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* Top bar functionality (full screen, rotate, zoom etc.) */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          {/* Button to navagiate down a page. NOTE: "aria-label" is added for screen reader and people with visualimpairment for example can see what button does with label added. */}
          <Button
            // Disabled the button if the current page is less than or equal to 1 to prevent it from going lower
            disabled={currPage <= 1}
            onClick={() => {
              // To ensure the page does not go below 1 (0 or negative number)
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              // Setting the value for the page field when increment or decrement. Value set to "page" input
              setValue("page", String(currPage - 1));
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Input custom page field */}
          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500" // Class name applied if there's error on page
              )}
              // When press 'enter', will want the page to apply pg #.
              onKeyDown={(e) => {
                // 'e' is the event
                if (e.key === "Enter") {
                  console.log("Success!");
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              {/* numPages get from the "onLoadSuccess" below */}
              {/* The '??' means if 'numPages' evaluates to null or undefined, set numPages to the second variable ('x' during loading state) */}
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            // Disabled button due to if numPages is left undefined to block serious errors or if current page is maxed out with "numPages". (READ next comment below)
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => {
              // Else, user can keep incrementing.
              // IMPORTANT - Error: Type 'number' ("numPages") is possible undefined and not assignable so insert "!" after end of "numPages" to tell TypeScript that I always know this will not be undefined and don't worry about it but if left undefined, could get serious error so to combat whole problem, disable button if the type is undefined
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              );
              // Setting the value for the page field when increment or decrement. Value set to "page" input
              setValue("page", String(currPage + 1));
            }}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            {/* To not have two buttons, pass 'asChild' property and Button is the one btn */}
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Set the rotation to 90 deg per click. */}
          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            aria-label="rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          {/* Custom Component for full screen */}
          {/* Get the "url" from prop passed in earlier and passed in into the "PdfFullScreen" file with "fileUrl" that was created in that component */}
          <PdfFullScreen fileUrl={url} />
        </div>
      </div>

      {/* PDF Page Render */}
      <div className="flex-1 w-full max-h-screen">
        {/* SimpleBar provides support and stability for zooming into pdf page. Ensures pdf never gets bigger than it can be */}
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
              // For getting total page #
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              file={url}
              className="max-h-full"
            >
              {/* If we have the width, use the width, if not, set it to 1. width is obtained from '{ref}' div tag earlier. */}
              {/* Optimize: Fixing the white space before page loads using states. Problem was detected when zooming into pages Conditionally rendering old page while keeping new page loading. */}
              {/* If "isLoading" and "renderedScale" is true and exists, render first page, else render null. */}
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + renderedScale}
                />
              ) : null}
              {/* The Page component is shown when loading "isLoading" */}
              <Page
                // Use "cn()" since we are conditionally applying a class name "hidden" property
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                // Give it certain identity. Composite key (something plus another thing).
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                // From ReactPDF Library - update render scale after success, when page is rendered and loading is finished.
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
