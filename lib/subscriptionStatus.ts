export function getSubscriptionStatus(nextBilling:Date){

  const today = new Date();

  const diff =
    (nextBilling.getTime() - today.getTime()) /
    (1000*60*60*24);

  if(diff > 3) return "paid";
  if(diff >= 0) return "due";

  return "overdue";
}