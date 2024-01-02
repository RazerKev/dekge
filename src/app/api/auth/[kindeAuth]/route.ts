import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: any) {
  // 'request' needs to be converted from JS to TS. 'request' is always type 'NextRequest'. 'params' we don't care, not messing with this file so leave the type to "any"
  const endpoint = params.kindeAuth;
  return handleAuth(request, endpoint);
}
