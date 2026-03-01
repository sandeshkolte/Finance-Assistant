import { plaidClient } from "./plaid";
import { setuClient } from "./setu";

export async function fetchTransactionsSync(provider: string, accessToken: string, cursor?: string) {
  if (provider === "plaid") {
    const res = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor: cursor,
    });
    return {
      added: res.data.added,
      nextCursor: res.data.next_cursor,
    };
  } else if (provider === "setu") {
    // For Setu, we usually trigger a data session first.
    // In this simplified version, we'll return mock data or handle the session.
    const session = await setuClient.fetchFinancialData(accessToken);
    return {
      added: [], // Data fetch is async in Setu, usually handled via webhooks
      nextCursor: session.id,
    };
  }

  return { added: [], nextCursor: cursor };
}
