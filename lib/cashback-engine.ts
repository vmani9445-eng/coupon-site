export function calculateCashback({
  commissionAmount,
  userType = "normal",
}: {
  commissionAmount: number; // in paise
  userType?: "normal" | "first_time" | "vip";
}) {
  let userPercent = 0.5; // default 50%

  // 🎯 BOOST RULES
  if (userType === "first_time") {
    userPercent = 0.7; // 70%
  }

  if (userType === "vip") {
    userPercent = 0.8; // 80%
  }

  const cashbackAmount = Math.floor(commissionAmount * userPercent);
  const platformMargin = commissionAmount - cashbackAmount;

  return {
    cashbackAmount,
    platformMargin,
  };
}