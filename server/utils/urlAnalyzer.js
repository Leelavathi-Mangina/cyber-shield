function analyzeUrl(rawUrl) {
  const signals = [];
  let score = 0;

  let normalizedUrl = rawUrl.trim();

  // Add protocol temporarily so URL() can parse domains such as example.com
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let parsed;

  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return {
      valid: false,
      score: 30,
      signals: ["Invalid or malformed URL structure detected"],
      metadata: null,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  const addSignal = (condition, points, message) => {
    if (condition) {
      score += points;
      signals.push(message);
    }
  };

  // HTTP
  addSignal(parsed.protocol === "http:", 10, "URL does not use HTTPS");

  // URL shorteners
  const shorteners = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "is.gd",
    "goo.gl",
    "ow.ly",
    "rb.gy",
  ];

  addSignal(
    shorteners.includes(hostname),
    20,
    "URL shortening service detected — final destination may be hidden",
  );

  // IP-address based URL
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;

  addSignal(
    ipRegex.test(hostname),
    25,
    "IP-address based URL detected instead of a normal domain",
  );

  // Too many subdomains
  const parts = hostname.split(".");

  addSignal(
    parts.length > 4,
    15,
    "Unusually high number of subdomains detected",
  );

  // @ symbol
  addSignal(
    rawUrl.includes("@"),
    20,
    "URL contains '@', which can be used to obscure the real destination",
  );

  // Excessive hyphens
  const hyphenCount = (hostname.match(/-/g) || []).length;

  addSignal(
    hyphenCount >= 3,
    10,
    "Domain contains an unusual number of hyphens",
  );

  // Suspicious keywords
  const suspiciousKeywords = [
    "login",
    "verify",
    "update",
    "secure",
    "account",
    "bank",
    "wallet",
    "payment",
    "password",
    "signin",
    "confirm",
    "bonus",
    "prize",
    "free",
  ];

  addSignal(
    suspiciousKeywords.some(
      (word) => hostname.includes(word) || pathname.includes(word),
    ),
    15,
    "Security, financial, or account-related keywords detected in the URL",
  );

  // Common brand names frequently impersonated in phishing URLs.
  // This is a heuristic signal, not proof that a website is malicious.
  const protectedBrands = [
    "google",
    "microsoft",
    "amazon",
    "paypal",
    "apple",
    "facebook",
    "instagram",
    "whatsapp",
    "netflix",
  ];

  const hostnameWithoutWww = hostname.replace(/^www\./, "");

  const brandImpersonation = protectedBrands.find((brand) => {
    const containsBrand = hostnameWithoutWww.includes(brand);

    if (!containsBrand) {
      return false;
    }

    // Do not flag the obvious official root domains in this MVP.
    const officialDomains = {
      google: ["google.com"],
      microsoft: ["microsoft.com"],
      amazon: ["amazon.com", "amazon.in"],
      paypal: ["paypal.com"],
      apple: ["apple.com"],
      facebook: ["facebook.com"],
      instagram: ["instagram.com"],
      whatsapp: ["whatsapp.com"],
      netflix: ["netflix.com"],
    };

    return !officialDomains[brand]?.some(
      (domain) =>
        hostnameWithoutWww === domain ||
        hostnameWithoutWww.endsWith(`.${domain}`),
    );
  });

  addSignal(
    Boolean(brandImpersonation),
    25,
    brandImpersonation
      ? `Possible ${brandImpersonation} brand impersonation detected in domain`
      : "",
  );

  // Very long URL
  addSignal(rawUrl.length > 120, 10, "Unusually long URL detected");

  // Encoded characters
  addSignal(
    /%[0-9a-f]{2}/i.test(rawUrl),
    5,
    "Encoded characters detected in the URL",
  );

  return {
    valid: true,
    score: Math.min(score, 100),
    signals,
    metadata: {
      protocol: parsed.protocol.replace(":", ""),
      hostname,
      pathname: parsed.pathname,
      subdomainCount: Math.max(parts.length - 2, 0),
      urlLength: rawUrl.length,
    },
  };
}

module.exports = { analyzeUrl };
