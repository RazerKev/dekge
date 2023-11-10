import ChatWrapper from "@/components/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileid: string; // Needs to match the value name of '[fileid]' in the directory of ./[fileid]
  };
}

// Page when URL lands on .../dashboard/[fileid]
// fileid automatically passed into the page by nextjs so destructure it
const Page = async ({ params }: PageProps) => {
  // Next.js passed in the fileid as 'params' automatically based on docs
  //'PageProps' can be named anything but this name makes sense

  // Retrieve the file id
  const { fileid } = params;

  // Make call from database (file URL, render PDF)
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // Guard Clause - User is not logged in but taken to the files, redirect them to auth callback page & if they have an account, then redirect them back because the 'origin=dashbaard' is passed.
  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  // Make call from database (file URL, render PDF)
  const file = await db.file.findFirst({
    where: {
      id: fileid, // fileid passed in as a param
      userId: user.id, // where userId matches the user.id from guard clause (needed for protection for each user)
    },
  });

  if (!file) notFound(); // Throws a 404 error when there's no file

  // After logical statement and checking, now display the content below. The 'h-[calc(100vh-3.5rem)]' contains 3.5rem to offset the navbar height.
  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      {/* custom 'max-w-8xl' from tailwind.config.ts*/}
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left SIde - PDF part */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            {/* file.url is being fetched from database */}
            <PdfRenderer url={file.url}/> 
          </div>
        </div>
        {/* Right Side - Chat PDF */}
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          {/* Wrapper Component - Wraps both input and message (seperate components but combined into one here) */}
          <ChatWrapper/>
        </div>
      </div>
    </div>
  );
};

export default Page;
