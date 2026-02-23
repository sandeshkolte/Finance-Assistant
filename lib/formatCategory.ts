export function formatCategory(t: any): string {
  if (typeof t.category === "string") return t.category;

  if (Array.isArray(t.category)) return t.category[0];

  if (t.personal_finance_category?.primary) {
    return t.personal_finance_category.primary
      .replaceAll("_", " ")
      .toLowerCase();
  }

  return "Other";
}