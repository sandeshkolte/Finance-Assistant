export function netWorth(accounts: any[]) {
  return accounts.reduce((sum, a) => sum + Number(a.balance), 0);
}