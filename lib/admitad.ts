export async function getAdmitadToken() {
  const clientId = process.env.ADMITAD_CLIENT_ID;
  const clientSecret = process.env.ADMITAD_CLIENT_SECRET;

  console.log("ADMITAD_CLIENT_ID:", clientId);
  console.log("ADMITAD_CLIENT_SECRET EXISTS:", !!clientSecret);

  if (!clientId || !clientSecret) {
    throw new Error("Missing Admitad credentials in .env.local");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append(
    "scope",
    [
      "coupons_for_website",
      "websites",
      "advcampaigns_for_website",
      "deeplink_generator",
    ].join(" ")
  );

  const res = await fetch("https://api.admitad.com/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Authorization: `Basic ${basicAuth}`,
    },
    body: params.toString(),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  console.log("ADMITAD TOKEN STATUS:", res.status);
  console.log("ADMITAD TOKEN RESPONSE:", data);

  if (!res.ok) {
    throw new Error(
      data?.error_description ||
        data?.error ||
        `Failed to get Admitad token (${res.status})`
    );
  }

  if (!data?.access_token) {
    throw new Error("Admitad access_token missing in response");
  }

  return data.access_token as string;
}