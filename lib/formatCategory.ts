export function formatCategory(t: any): string {
  // 1. Check if category is already provided as a string or array
  if (typeof t.category === "string") return t.category;
  if (Array.isArray(t.category) && t.category.length > 0) return t.category[0];

  // 2. Check for schema-specific personal finance categories (e.g., Plaid/generic)
  if (t.personal_finance_category?.primary) {
    return t.personal_finance_category.primary
      .replaceAll("_", " ")
      .toLowerCase();
  }

  // 3. Smart Fallback: Categorize based on merchant name keywords
  const name = (t.name || t.merchant || "").toLowerCase();

  if (name.includes("zomato") || name.includes("swiggy") || name.includes("restaurant") || name.includes("dining")) return "food and drink";
  if (name.includes("amazon") || name.includes("flipkart") || name.includes("supermarket") || name.includes("grocery")) return "shopping";
  if (name.includes("uber") || name.includes("ola") || name.includes("petrol") || name.includes("fuel") || name.includes("travel")) return "travel";
  if (name.includes("salary") || name.includes("credit") || name.includes("deposit")) return "income";
  if (name.includes("netflix") || name.includes("spotify") || name.includes("disney") || name.includes("movie")) return "entertainment";
  if (name.includes("rent") || name.includes("electricity") || name.includes("water") || name.includes("bill")) return "utilities";

  // 4. Secondary Fallback: Use Setu's 'Mode' and 'Type' (passed in t.category)
  const modeFlavor = (t.category || "").toLowerCase();
  if (modeFlavor.includes("atm")) return "cash withdrawal";
  if (modeFlavor.includes("cash") && modeFlavor.includes("credit")) return "cash deposit";
  if (modeFlavor.includes("upi")) return "upi transfer";
  if (modeFlavor.includes("card")) return "card payment";

  return "other";
}