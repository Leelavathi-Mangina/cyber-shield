const { analyzeUrl } = require("../utils/urlAnalyzer");

function analyzeContent(content, inputType = "message") {
  const text = content.toLowerCase();

  let riskScore = 0;
  const detectedSignals = [];
  const recommendations = [];
  const evidence = [];
  let urlIntelligence = null;

  const addSignal = (
    condition,
    score,
    message,
    matchedText = null,
    category = null,
  ) => {
    if (condition) {
      riskScore += score;
      detectedSignals.push(message);

      if (matchedText) {
        evidence.push({
          matchedText,
          category,
          explanation: message,
        });
      }
    }
  };

  // 1. Urgency / pressure language
  const urgencyWords = [
    "urgent",
    "immediately",
    "act now",
    "verify now",
    "limited time",
    "within 24 hours",
    "account suspended",
    "account blocked",
  ];

  const matchedUrgencyWords = urgencyWords.filter((word) =>
    text.includes(word),
  );

  if (matchedUrgencyWords.length > 0) {
    riskScore += 15;
    detectedSignals.push("Urgency or pressure language detected");

    matchedUrgencyWords.forEach((word) => {
      evidence.push({
        matchedText: word,
        category: "Urgency",
        explanation: "Urgency or pressure language detected",
      });
    });
  }

  // 2. Sensitive credential requests
  const credentialWords = [
    "otp",
    "password",
    "pin",
    "cvv",
    "login details",
    "bank details",
    "account number",
  ];

  const matchedCredentialWords = credentialWords.filter((word) =>
    text.includes(word),
  );

  if (matchedCredentialWords.length > 0) {
    riskScore += 30;
    detectedSignals.push("Request for sensitive credentials detected");

    matchedCredentialWords.forEach((word) => {
      evidence.push({
        matchedText: word,
        category: "Credentials",
        explanation: "Request for sensitive credentials detected",
      });
    });
  }

  // 3. Financial/payment signals
  const financialWords = [
    "send money",
    "payment",
    "upi",
    "refund",
    "bank account",
    "transfer money",
    "pay now",
  ];

  const matchedFinancialWords = financialWords.filter((word) =>
    text.includes(word),
  );

  if (matchedFinancialWords.length > 0) {
    riskScore += 20;
    detectedSignals.push("Financial or payment-related request detected");

    matchedFinancialWords.forEach((word) => {
      evidence.push({
        matchedText: word,
        category: "Financial",
        explanation: "Financial or payment-related request detected",
      });
    });
  }

  // 4. Reward / prize scam language
  const rewardWords = [
    "winner",
    "won a prize",
    "claim prize",
    "lottery",
    "free gift",
    "congratulations you won",
  ];

  const matchedRewardWords = rewardWords.filter((word) => text.includes(word));

  if (matchedRewardWords.length > 0) {
    riskScore += 20;
    detectedSignals.push("Prize or reward-based scam pattern detected");

    matchedRewardWords.forEach((word) => {
      evidence.push({
        matchedText: word,
        category: "Reward",
        explanation: "Prize or reward-based scam pattern detected",
      });
    });
  }

  // 5. Suspicious links
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = content.match(urlRegex) || [];

  const shortenedDomains = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd"];

  addSignal(
    urls.some((url) =>
      shortenedDomains.some((domain) => url.toLowerCase().includes(domain)),
    ),
    20,
    "Shortened URL detected — destination may be hidden",
  );

  addSignal(
    urls.some((url) => url.toLowerCase().startsWith("http://")),
    10,
    "Non-HTTPS URL detected",
  );

  // 6. IP-address based URLs
  const ipUrlRegex = /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?:[:/][^\s]*)?/i;

  addSignal(ipUrlRegex.test(content), 20, "IP-address based URL detected");

  if (inputType === "url") {
    urlIntelligence = analyzeUrl(content);

    riskScore += urlIntelligence.score;

    urlIntelligence.signals.forEach((signal) => {
      if (!detectedSignals.includes(signal)) {
        detectedSignals.push(signal);
      }
    });
  }

  // Cap score
  riskScore = Math.min(riskScore, 100);

  let riskLevel = "low";

  if (riskScore >= 60) {
    riskLevel = "high";
  } else if (riskScore >= 30) {
    riskLevel = "medium";
  }

  // Recommendations
  if (riskLevel === "high") {
    recommendations.push(
      "Do not click suspicious links.",
      "Do not share OTPs, passwords, PINs, or banking credentials.",
      "Verify the message using the organization's official website, app, or phone number.",
      "Report suspicious content if possible.",
    );
  } else if (riskLevel === "medium") {
    recommendations.push(
      "Verify the sender before taking action.",
      "Avoid sharing sensitive information.",
      "Open official websites directly instead of using message links.",
    );
  } else {
    recommendations.push(
      "No major warning signals were detected by the current analysis.",
      "Remain cautious with unknown senders and unexpected requests.",
    );
  }

  return {
    inputType,
    riskScore,
    riskLevel,
    detectedSignals,
    recommendations,
    evidence,
    urlIntelligence,
  };
}

module.exports = { analyzeContent };
