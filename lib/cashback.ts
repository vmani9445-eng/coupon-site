export function getStoreCashback(storeSlug: string) {
  const map: Record<string, string> = {
    amazon: "Up to 7% extra cashback",
    flipkart: "Up to 6% extra cashback",
    myntra: "Up to 8% extra cashback",
    ajio: "Up to 10% extra cashback",
    nykaa: "Up to 9% extra cashback",
    "tata-cliq": "Up to 7% extra cashback",
  };

  return map[storeSlug] || "Up to 5% extra cashback";
}