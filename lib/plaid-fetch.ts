import { plaidClient } from "./plaid";

export async function fetchTransactions(access_token: string) {
  const res = await plaidClient.transactionsSync({
    access_token,
  });

  return res.data.added;
}
