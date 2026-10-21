import { env } from "cloudflare:workers";
import { handleInquiry } from "../../../lib/inquiry-handler.mjs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) { return handleInquiry(request, env.DB); }
