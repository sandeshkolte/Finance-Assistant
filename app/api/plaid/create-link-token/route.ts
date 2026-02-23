import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { auth } from "@clerk/nextjs/server";
import { Products, CountryCode } from "plaid";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "Finance SaaS",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return NextResponse.json({ link_token: response.data.link_token });
}
