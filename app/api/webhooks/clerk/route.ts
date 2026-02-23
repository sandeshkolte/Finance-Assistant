export const runtime = "nodejs";

import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  console.log("Received webhook from Clerk");

  const payload = await req.text();
  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature)
    return new Response("Missing svix headers", { status: 400 });

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    console.log("Webhook verified:", evt.type);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {},
      create: {
        clerkId: id,
        email: email_addresses[0].email_address,
        name: `${first_name ?? ""} ${last_name ?? ""}`,
      },
    });

    console.log("User synced to DB:", id);
  }

  return new Response("OK", { status: 200 });
}
