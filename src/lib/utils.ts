import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Need to make this helper utility below since the "createStripeSession" API Endpoint since we're on server-side and need "ABSOLUTE URL"; can't use "Relative URL"
// "path" arg can be "relative/dashboard"
// Useful function for redirecting the user to a specific page after they complete a certain action. Reason for "absoluteUrl" to be created is, unlike relative url, absolute url has no page context to resolve relative URLs against. Server doesn't inherently know root of the site and it needs to be generated to correctly resolved regardless of where they're used. Relative URLs are sufficient since the browser automatically resolves these URLs based on current page's URL. For example, (if you’re on https://example.com/page1 and there’s a link with the relative URL /page2, the browser understands that this refers to https://example.com/page2).
export function absoluteUrl(path: string) {
  // If true, this means we're on the "CLIENT SIDE" & can return relative path since client is fine with relative paths. "window" object is only available in the browser so if not defined, then code must be running on the server.
  if (typeof window !== "undefined") return path; // Relative path

  // Else, if we're on the server-side and have deployed on Vercel,
  // "https://${process.env.VERCEL_URL}" is the root URL by default like "https://yourwebsite.com" and the "${path}" is "/dashboard" or any string that's passed in
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`;

  //------------- Local Development Below -------------

  // In all other cases, last case; absolute url. Used for local development environments and is running on own machine. Production env is used above with "https://" to encrypt data sent between client and server
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}


// Metadata part of website and this part also is shown on the browser tab when hovering mouse on it
export function constructMetadata({
  title = "Dekge - SaaS for Documents",
  description = "Dekge is a software that makes chatting with your document files easy.",
  image = "/thumbnail.png", // Image that pops up when sharing the website as an icon
  icons = "/favicon.ico", // Icon on the browser tab
  noIndex = false, // Setting it to false allow search engine to crawl and index website so it shows on Google
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata { // Saying this whole thing of function is type Metadata which is provided by Next.js
  return {
    // Can return these since we give default values above
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image, // the image passed above in the "image = "/thumbnail.png""
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image], // Takes an array but only want a single image in there
      creator: "", // Passed in my twitter name
    },
    icons,
    // metadataBase: new URL(""), // Put the production URL obtained from Vercel 
    themeColor: "FFF",
    // Prevent this page from being indexed to search engine
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  };
}