import crypto from "crypto";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ActivationRedirect from "../../Components/ActivationRedirect";
import "./activation.css";

type Props = {
  params: Promise<{ couponId: string }>;
};

function isRealCashbackSource(source?: string | null) {
  const value = (source || "").trim().toLowerCase();
  return value === "admitad" || value === "cuelinks";
}

function getCouponCashbackText(coupon: {
  source?: string | null;
  cashbackLabel?: string | null;
  userCashback?: number | null;
  extraCashback?: string | null;
}) {
  if (!isRealCashbackSource(coupon.source)) {
    return null;
  }

  if (coupon.cashbackLabel?.trim()) {
    return coupon.cashbackLabel.trim();
  }

  if (typeof coupon.userCashback === "number" && coupon.userCashback > 0) {
    return `Up to ${coupon.userCashback}% cashback`;
  }

  if (coupon.extraCashback?.trim()) {
    return coupon.extraCashback.trim();
  }

  return null;
}

function buildTerms(coupon: {
  type?: string | null;
  code?: string | null;
  cashbackText?: string | null;
  terms?: string[] | null;
}) {
  if (coupon.terms && coupon.terms.length > 0) return coupon.terms;

  const terms: string[] = [
    "Make sure to complete your transaction within the opened tab.",
    "Do not visit other coupon or cashback websites before checkout.",
    "Cancelled, returned, or exchanged orders may not be eligible for cashback.",
    "Cashback confirmation may take time depending on the store.",
  ];

  if (coupon.code) {
    terms.splice(
      2,
      0,
      `Use coupon code "${coupon.code}" at checkout if applicable.`
    );
  }

  if (coupon.type === "deal") {
    terms.push("This is a deal offer, so a coupon code may not be required.");
  }

  if (coupon.cashbackText) {
    terms.push(
      "Additional cashback may take extra time to reflect in your account."
    );
  }

  return terms;
}

function getDiscountLabel(discount?: string | null) {
  const value = (discount || "").trim();
  if (!value) return null;
  return value.toUpperCase();
}

function createTrackingCode() {
  return `trk_${Date.now()}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export default async function OutCouponPage({ params }: Props) {
  const { couponId } = await params;

  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase() || null;

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    include: {
      store: true,
    },
  });

  if (!coupon || !coupon.store || !coupon.affiliateUrl) {
    notFound();
  }

  const dbUser = userEmail
    ? await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
        },
      })
    : null;

  const isLoggedIn = !!dbUser;

  let trackingCode: string;

  if (dbUser) {
    const recentClick = await prisma.clickLog.findFirst({
      where: {
        userId: dbUser.id,
        couponId: coupon.id,
        clickedAt: {
          gte: new Date(Date.now() - 1000 * 60 * 10),
        },
      },
      orderBy: {
        clickedAt: "desc",
      },
      select: {
        trackingCode: true,
      },
    });

    if (recentClick?.trackingCode) {
      trackingCode = recentClick.trackingCode;
    } else {
      trackingCode = createTrackingCode();

      await prisma.clickLog.create({
        data: {
          userId: dbUser.id,
          storeId: coupon.storeId,
          couponId: coupon.id,
          trackingCode,
          clickType: "COUPON",
          targetUrl: coupon.affiliateUrl || coupon.store?.websiteUrl || "",
          sourcePage: `/out/${coupon.id}`,
          sourceLabel: "activation-page",
          storeSlug: coupon.store.slug,
          userEmail: dbUser.email,
          status: "CLICKED",
        },
      });
    }
  } else {
    trackingCode = createTrackingCode();

    await prisma.clickLog.create({
      data: {
        storeId: coupon.storeId,
        couponId: coupon.id,
        trackingCode,
        clickType: "COUPON",
        targetUrl: coupon.affiliateUrl || coupon.store?.websiteUrl || "",
        sourcePage: `/out/${coupon.id}`,
        sourceLabel: "activation-page",
        storeSlug: coupon.store.slug,
        status: "CLICKED",
      },
    });
  }

  const similarOffers = await prisma.coupon.findMany({
    where: {
      storeId: coupon.storeId,
      id: { not: coupon.id },
      isActive: true,
    },
    include: {
      store: true,
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  const cashbackText = getCouponCashbackText({
    source: coupon.source,
    cashbackLabel: coupon.cashbackLabel,
    userCashback: coupon.userCashback,
    extraCashback: (coupon as { extraCashback?: string | null }).extraCashback,
  });

  const terms = buildTerms({
    type: (coupon as { type?: string | null }).type,
    code: coupon.code,
    cashbackText,
    terms: (coupon.terms as string[] | null) ?? null,
  });

  const storeInitial =
    (coupon.store as { logoText?: string | null }).logoText?.trim()?.charAt(0) ||
    coupon.store.name?.trim()?.charAt(0) ||
    "S";

  const discountLabel = getDiscountLabel(coupon.discount);

  return (
    <main className="activationPage">
      <ActivationRedirect trackingCode={trackingCode} />

      <section className="activationHero">
        <div className="activationContainer">
          <Link
            href={`/stores/${coupon.store.slug}`}
            className="activationBack"
          >
            ← Go Back
          </Link>

          <div className="activationHeroCard">
            <div className="activationTop">
              <div className="activationVisual">
                <div className="activationLogoBox">
                  {coupon.store.logo ? (
                    <img
                      src={coupon.store.logo}
                      alt={coupon.store.name}
                      className="activationLogoImage"
                    />
                  ) : (
                    <div className="activationLogoFallback">{storeInitial}</div>
                  )}
                </div>

                {discountLabel && (
                  <div className="activationDiscountBadge">{discountLabel}</div>
                )}
              </div>

              <div className="activationMain">
                <div className="activationBrandRow">
                  <span className="activationBrandName">
                    {coupon.store.name}
                  </span>
                  <div className="activationProgressDots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="activationBrandStatus">ACTIVATING</span>
                </div>

                {cashbackText ? (
                  !isLoggedIn ? (
                    <p className="activationEligibility">
                      Sign up and get <strong>{cashbackText}</strong> cashback on
                      this order
                    </p>
                  ) : (
                    <p className="activationEligibility activationEligibilitySuccess">
                      You’re earning <strong>{cashbackText}</strong> cashback on
                      this order
                    </p>
                  )
                ) : !isLoggedIn ? (
                  <p className="activationEligibility">
                    Sign up to unlock extra cashback on this order
                  </p>
                ) : (
                  <p className="activationEligibility activationEligibilitySuccess">
                    Cashback tracking is active for this order
                  </p>
                )}

                <h1 className="activationTitle">{coupon.title}</h1>

                <div style={{ fontSize: 12, color: "#667085", marginTop: 8 }}>
                  Tracking: {trackingCode || "NO_TRACKING_CODE"}
                </div>

                {cashbackText && (
                  <div className="activationCashbackInline">
                    <span className="activationCashbackIcon">💸</span>
                    <span>Additional cashback:</span>
                    <strong>{cashbackText}</strong>
                  </div>
                )}

                <div className="activationLoadingLine">
                  <div className="activationLoaderDots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>
                    Redirecting you to {coupon.store.name}. Complete checkout in
                    the opened tab to keep tracking active.
                  </span>
                </div>

                <div className="activationCodeBox">
                  <p className="activationCodeHint">
                    {coupon.code
                      ? "Use this coupon code at checkout"
                      : "No coupon code needed for this offer"}
                  </p>

                  {coupon.code ? (
                    <div className="activationCouponCode">{coupon.code}</div>
                  ) : (
                    <div className="activationNoCode">NO CODE REQUIRED</div>
                  )}
                </div>

                <div className="activationActions">
                  <Link
                    href={`/go/${trackingCode}`}
                    className="activationStoreBtn"
                  >
                    Continue to Store
                  </Link>

                  {!isLoggedIn ? (
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(
                        `/out/${coupon.id}`
                      )}`}
                      className="activationLoginBtn"
                    >
                      Login for extra cashback
                    </Link>
                  ) : (
                    <div className="activationLoggedInNote">
                      Extra cashback active
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="activationContent">
        <div className="activationContainer activationContentGrid">
          <div className="activationSection activationTermsSection">
            <h2 className="activationSectionTitle">Terms & Conditions</h2>

            <div className="activationChecklist">
              {terms.map((term, index) => (
                <div
                  key={`${term}-${index}`}
                  className="activationChecklistItem"
                >
                  <span className="activationCheck">✔</span>
                  <p>{term}</p>
                </div>
              ))}
            </div>
          </div>

          {similarOffers.length > 0 && (
            <div className="activationSection">
              <h2 className="activationSectionTitle">Similar Offers</h2>

              <div className="activationSimilarGrid">
                {similarOffers.map((item) => (
                  <Link
                    key={item.id}
                    href={`/out/${item.id}`}
                    className="activationOfferCard"
                  >
                    <h3 className="activationOfferTitle">{item.title}</h3>
                    <span className="activationOfferBtn">Active Cashback</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}