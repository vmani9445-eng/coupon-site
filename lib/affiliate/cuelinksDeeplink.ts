export type CuelinksDeepLinkResponse =
  | {
      ok: true;
      url: string;
      raw: unknown;
    }
  | {
      ok: false;
      error: string;
    };

function pickDeepLink(data: any): string | null {
  if (!data) return null;

  return (
    data.affiliate_link ||
    data.short_url ||
    data.url ||
    data.deep_link ||
    data.deeplink ||
    data.link ||
    data.data?.affiliate_link ||
    data.data?.short_url ||
    data.data?.url ||
    data.data?.deep_link ||
    data.data?.deeplink ||
    data.data?.link ||
    null
  );
}

export async function createCuelinksDeepLink(
  targetUrl: string
): Promise<CuelinksDeepLinkResponse> {
  const apiKey = process.env.CUELINKS_API_KEY;

  if (!apiKey) {
    return { ok: false, error: "Missing CUELINKS_API_KEY" };
  }

  const apiUrl = `https://api.cuelinks.com/v2/deeplink?url=${encodeURIComponent(
    targetUrl
  )}`;

  const res = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Token ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Cuelinks deeplink error ${res.status}: ${text || "Unknown error"}`,
    };
  }

  const data = await res.json().catch(() => null);
  const deeplink = pickDeepLink(data);

  if (!deeplink) {
    return {
      ok: false,
      error: "Cuelinks deeplink missing in response",
    };
  }

  return {
    ok: true,
    url: deeplink,
    raw: data,
  };
}