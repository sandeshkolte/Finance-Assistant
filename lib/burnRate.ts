export function burnRate(transactions: any[]) {
  const now = new Date();

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth()
      && d.getFullYear() === now.getFullYear();
  });

  const spent = thisMonth.reduce((a, t) => a + Number(t.amount), 0);

  const daysPassed = now.getDate();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const projected = (spent / daysPassed) * totalDays;

  return {
    spent,
    projected: Math.round(projected)
  };
}