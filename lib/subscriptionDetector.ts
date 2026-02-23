export function detectSubscriptions(transactions: any[]) {
  const groups: Record<string, any[]> = {};

  for (const t of transactions) {
    if (!groups[t.merchant]) groups[t.merchant] = [];
    groups[t.merchant].push(t);
  }

  const subscriptions = [];

  for (const merchant in groups) {
    const txns = groups[merchant].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (txns.length < 2) continue;

    for (let i = 1; i < txns.length; i++) {
      const prev = txns[i - 1];
      const curr = txns[i];

      const days =
        (new Date(curr.date).getTime() -
          new Date(prev.date).getTime()) /
        (1000 * 60 * 60 * 24);

      const diff = Math.abs(Number(curr.amount) - Number(prev.amount));

      if (days > 25 && days < 35 && diff < 5) {

        const lastDate = new Date(curr.date);
        const nextBilling = new Date(lastDate);
        nextBilling.setDate(nextBilling.getDate() + Math.round(days));

        subscriptions.push({
          merchant,
          amount: Number(curr.amount),
          lastPayment: lastDate,
          interval: Math.round(days),
          nextBilling
        });

        break;
      }
    }
  }

  return subscriptions;
}