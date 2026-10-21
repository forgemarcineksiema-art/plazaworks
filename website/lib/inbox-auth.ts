import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isOwnerIdentity } from "./inbox-access.mjs";
export async function isInboxOwner() {
  const requestHeaders = await headers();
  const id = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  if (!id || !email) redirect("/signin-with-chatgpt?return_to=%2Fskrzynka");
  return isOwnerIdentity(id, email);
}
