type CategoryName =
  | "Fashion"
  | "Health & Beauty"
  | "Electronics"
  | "Travel"
  | "Food & Grocery"
  | "Entertainment"
  | "Education"
  | "Software"
  | "Services"
  | "Finance"
  | "Baby & Kids"
  | "Home & Kitchen"
  | "Flowers & Gifts"
  | "Gaming"
  | "Books"
  | "Artificial Intelligence"
  | "Sports"
  | "Recharge"
  | "Other";

type NormalizeCategoryInput = {
  rawCategory?: string | null;
  storeName?: string | null;
  websiteUrl?: string | null;
  title?: string | null;
  description?: string | null;
};

const merchantCategoryMap: Record<string, CategoryName> = {
  amazon: "Electronics",
  flipkart: "Electronics",
  myntra: "Fashion",
  ajio: "Fashion",
  nykaa: "Health & Beauty",
  tatacliq: "Fashion",
  "tata cliq": "Fashion",
  meesho: "Fashion",
  pepperfry: "Home & Kitchen",
  firstcry: "Baby & Kids",
  croma: "Electronics",
  vijaysales: "Electronics",
  "vijay sales": "Electronics",
  reliancedigital: "Electronics",
  "reliance digital": "Electronics",
  boat: "Electronics",
  samsung: "Electronics",
  apple: "Electronics",
  oppo: "Electronics",
  vivo: "Electronics",
  oneplus: "Electronics",
  realme: "Electronics",
  udemy: "Education",
  coursera: "Education",
  unacademy: "Education",
  upgrad: "Education",
  simplilearn: "Education",
  makemytrip: "Travel",
  goibibo: "Travel",
  yatra: "Travel",
  agoda: "Travel",
  booking: "Travel",
  cleartrip: "Travel",
  easemytrip: "Travel",
  ixigo: "Travel",
  airasia: "Travel",
  namecheap: "Services",
  hostinger: "Services",
  godaddy: "Services",
  bigrock: "Services",
  bluehost: "Services",
  zoho: "Services",
  canva: "Software",
  adobe: "Software",
  microsoft: "Software",
  hubspot: "Software",
  semrush: "Software",
  zomato: "Food & Grocery",
  swiggy: "Food & Grocery",
  blinkit: "Food & Grocery",
  zepto: "Food & Grocery",
  bigbasket: "Food & Grocery",
  jiomart: "Food & Grocery",
  netflix: "Entertainment",
  hotstar: "Entertainment",
  primevideo: "Entertainment",
  spotify: "Entertainment",
  sony: "Entertainment",
  xbox: "Gaming",
  playstation: "Gaming",
  steam: "Gaming",
  kindle: "Books",
  audible: "Books",
  fernsnpetals: "Flowers & Gifts",
  "ferns n petals": "Flowers & Gifts",
  interflora: "Flowers & Gifts",
  hdfc: "Finance",
  icici: "Finance",
  axis: "Finance",
  sbi: "Finance",
  kotak: "Finance",
  airtel: "Recharge",
  jio: "Recharge",
  vi: "Recharge",
  bsnl: "Recharge",
  cultfit: "Sports",
  decathlon: "Sports",
  nike: "Sports",
  puma: "Sports",
  adidas: "Sports",
  asics: "Sports",
  mamaearth: "Health & Beauty",
  wow: "Health & Beauty",
  plum: "Health & Beauty",
  mcaffeine: "Health & Beauty",
  minimalist: "Health & Beauty",
  aqualogica: "Health & Beauty",
  wowskin: "Health & Beauty",
  wowskinscience: "Health & Beauty",
};

const categoryKeywordMap: Array<{
  keywords: string[];
  category: CategoryName;
}> = [
  {
    keywords: [
      "fashion",
      "clothing",
      "apparel",
      "wear",
      "kurta",
      "kurti",
      "dress",
      "shirt",
      "tshirt",
      "t-shirt",
      "jeans",
      "saree",
      "lehenga",
      "footwear",
      "shoe",
      "shoes",
      "sneaker",
      "watch",
      "bag",
      "handbag",
      "wallet",
      "jewellery",
      "jewelry",
      "accessories",
      "lifestyle fashion",
    ],
    category: "Fashion",
  },
  {
    keywords: [
      "beauty",
      "cosmetic",
      "cosmetics",
      "skincare",
      "skin care",
      "haircare",
      "hair care",
      "makeup",
      "grooming",
      "wellness beauty",
      "perfume",
      "fragrance",
      "lipstick",
      "serum",
      "sunscreen",
      "face wash",
      "moisturizer",
      "shampoo",
      "health & beauty",
    ],
    category: "Health & Beauty",
  },
  {
    keywords: [
      "electronics",
      "electronic",
      "mobile",
      "smartphone",
      "phone",
      "laptop",
      "tablet",
      "headphone",
      "earbuds",
      "speaker",
      "camera",
      "tv",
      "television",
      "appliance",
      "gadgets",
      "printer",
      "monitor",
      "smart watch",
      "smartwatch",
    ],
    category: "Electronics",
  },
  {
    keywords: [
      "travel",
      "flight",
      "hotel",
      "holiday",
      "trip",
      "booking",
      "tour",
      "bus",
      "train",
      "airline",
      "airlines",
      "resort",
      "vacation",
      "stay",
      "visa",
      "cab",
    ],
    category: "Travel",
  },
  {
    keywords: [
      "food",
      "grocery",
      "groceries",
      "restaurant",
      "delivery",
      "snacks",
      "meal",
      "meals",
      "fresh",
      "fruits",
      "vegetables",
      "mart",
      "kitchen staples",
      "beverages",
    ],
    category: "Food & Grocery",
  },
  {
    keywords: [
      "entertainment",
      "ott",
      "movies",
      "movie",
      "music",
      "streaming",
      "shows",
      "video subscription",
      "podcast",
      "concert",
    ],
    category: "Entertainment",
  },
  {
    keywords: [
      "education",
      "course",
      "courses",
      "learning",
      "certification",
      "upskill",
      "training",
      "exam",
      "study",
      "students",
      "tutorial",
      "academy",
    ],
    category: "Education",
  },
  {
    keywords: [
      "software",
      "saas",
      "app",
      "apps",
      "tool",
      "tools",
      "design software",
      "editing software",
      "crm",
      "analytics software",
      "marketing software",
      "plugin",
      "antivirus",
      "vpn",
      "cloud software",
      "ai tool",
      "ai tools",
    ],
    category: "Software",
  },
  {
    keywords: [
      "hosting",
      "domain",
      "server",
      "website builder",
      "email hosting",
      "web hosting",
      "vps",
      "ssl",
      "business services",
      "productivity",
      "office tools",
    ],
    category: "Services",
  },
  {
    keywords: [
      "finance",
      "bank",
      "loan",
      "credit card",
      "debit card",
      "insurance",
      "investment",
      "mutual fund",
      "demat",
      "trading",
      "wallet",
      "upi",
      "broker",
      "financial",
    ],
    category: "Finance",
  },
  {
    keywords: [
      "baby",
      "kids",
      "toys",
      "newborn",
      "infant",
      "diaper",
      "school kids",
      "childcare",
      "children",
      "baby care",
    ],
    category: "Baby & Kids",
  },
  {
    keywords: [
      "home",
      "kitchen",
      "furniture",
      "decor",
      "home decor",
      "sofa",
      "mattress",
      "bedsheet",
      "cookware",
      "utensils",
      "appliances home",
      "dining",
      "storage",
    ],
    category: "Home & Kitchen",
  },
  {
    keywords: [
      "flowers",
      "gift",
      "gifts",
      "bouquet",
      "personalized gift",
      "cakes",
      "gifting",
      "anniversary gift",
      "birthday gift",
    ],
    category: "Flowers & Gifts",
  },
  {
    keywords: [
      "gaming",
      "game",
      "games",
      "esports",
      "xbox",
      "playstation",
      "steam",
      "gaming gear",
    ],
    category: "Gaming",
  },
  {
    keywords: [
      "books",
      "book",
      "ebook",
      "e-book",
      "audiobook",
      "novel",
      "magazine",
      "publication",
    ],
    category: "Books",
  },
  {
    keywords: [
      "artificial intelligence",
      "ai",
      "machine learning",
      "llm",
      "gpt",
      "image generation",
      "ai assistant",
    ],
    category: "Artificial Intelligence",
  },
  {
    keywords: [
      "sports",
      "fitness",
      "gym",
      "running",
      "cycling",
      "training gear",
      "workout",
      "sportswear",
      "sports equipment",
    ],
    category: "Sports",
  },
  {
    keywords: [
      "recharge",
      "mobile recharge",
      "dth",
      "broadband recharge",
      "prepaid",
      "postpaid",
      "data pack",
    ],
    category: "Recharge",
  },
];

function cleanText(value?: string | null) {
  return (value || "").toLowerCase().trim();
}

function normalizeMerchantKey(value?: string | null) {
  return cleanText(value).replace(/[^a-z0-9]/g, "");
}

function extractDomainKey(url?: string | null) {
  const raw = (url || "").trim();
  if (!raw) return "";

  try {
    const safeUrl = raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;

    const hostname = new URL(safeUrl).hostname.replace(/^www\./, "");
    const root = hostname.split(".")[0] || "";
    return normalizeMerchantKey(root);
  } catch {
    return "";
  }
}

function findCategoryByKeywords(text: string): CategoryName | null {
  if (!text) return null;

  for (const item of categoryKeywordMap) {
    if (item.keywords.some((keyword) => text.includes(keyword))) {
      return item.category;
    }
  }

  return null;
}

export function normalizeCategory(input: NormalizeCategoryInput): CategoryName {
  const rawCategory = cleanText(input.rawCategory);
  const storeName = cleanText(input.storeName);
  const websiteUrl = cleanText(input.websiteUrl);
  const title = cleanText(input.title);
  const description = cleanText(input.description);

  const merchantKey = normalizeMerchantKey(storeName);
  const domainKey = extractDomainKey(websiteUrl);

  if (merchantKey && merchantCategoryMap[merchantKey]) {
    return merchantCategoryMap[merchantKey];
  }

  if (domainKey && merchantCategoryMap[domainKey]) {
    return merchantCategoryMap[domainKey];
  }

  const categoryMatch = findCategoryByKeywords(rawCategory);
  if (categoryMatch) {
    return categoryMatch;
  }

  const combinedText = [storeName, title, description, websiteUrl]
    .filter(Boolean)
    .join(" ");

  const textMatch = findCategoryByKeywords(combinedText);
  if (textMatch) {
    return textMatch;
  }

  return "Other";
}