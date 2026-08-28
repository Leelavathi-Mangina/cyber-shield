const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const Analysis = require("./models/Analysis");

const { analyzeContent } = require("./services/riskEngine");
const { fetchRdapDomainData } = require("./services/domainIntelligence");
const { checkUrlReputation } = require("./services/threatReputation");

const qrRoutes = require("./routes/qrRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/qr", qrRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cyber Shield API is running",
  });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { content, inputType = "message" } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required for analysis.",
      });
    }

    const result = analyzeContent(content.trim(), inputType);

    let domainIntelligence = null;
    let threatReputation = null;

    if (inputType === "url") {
      try {
        let normalizedUrl = content.trim();

        if (!/^https?:\/\//i.test(normalizedUrl)) {
          normalizedUrl = `https://${normalizedUrl}`;
        }

        const parsedUrl = new URL(normalizedUrl);
        const hostname = parsedUrl.hostname.replace(/^www\./, "");

        domainIntelligence = await fetchRdapDomainData(hostname);
        threatReputation = await checkUrlReputation(normalizedUrl);
      } catch (error) {
        domainIntelligence = {
          success: false,
          error: "Unable to parse domain for registration lookup",
        };
      }
    }

    // Add live domain-age evidence to the existing risk result.
    if (
      inputType === "url" &&
      domainIntelligence?.success &&
      domainIntelligence.ageRiskScore > 0
    ) {
      result.riskScore = Math.min(
        result.riskScore + domainIntelligence.ageRiskScore,
        100,
      );

      if (
        domainIntelligence.ageSignal &&
        !result.detectedSignals.includes(domainIntelligence.ageSignal)
      ) {
        result.detectedSignals.push(domainIntelligence.ageSignal);
      }

      if (domainIntelligence.ageSignal) {
        result.evidence.push({
          matchedText:
            domainIntelligence.ageDays !== null
              ? `${domainIntelligence.ageDays} days old`
              : "Recently registered domain",

          category: "Domain Intelligence",

          explanation: domainIntelligence.ageSignal,
        });
      }

      // Recalculate classification after adding dynamic evidence.
      if (result.riskScore >= 60) {
        result.riskLevel = "high";
      } else if (result.riskScore >= 30) {
        result.riskLevel = "medium";
      } else {
        result.riskLevel = "low";
      }
    }

    if (
      inputType === "url" &&
      threatReputation?.success &&
      threatReputation.reputationRiskScore > 0
    ) {
      result.riskScore = Math.min(
        result.riskScore + threatReputation.reputationRiskScore,
        100,
      );

      if (
        threatReputation.reputationSignal &&
        !result.detectedSignals.includes(threatReputation.reputationSignal)
      ) {
        result.detectedSignals.push(threatReputation.reputationSignal);
      }

      if (threatReputation.reputationSignal) {
        result.evidence.push({
          matchedText: "External threat reputation",
          category: "Threat Intelligence",
          explanation: threatReputation.reputationSignal,
        });
      }

      if (result.riskScore >= 60) {
        result.riskLevel = "high";
      } else if (result.riskScore >= 30) {
        result.riskLevel = "medium";
      } else {
        result.riskLevel = "low";
      }
    }

    let savedAnalysis = null;

    try {
      savedAnalysis = await Analysis.create({
        inputType,
        inputContent: content.trim(),
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        detectedSignals: result.detectedSignals,
        recommendations: result.recommendations,
        evidence: result.evidence,
        domainIntelligence,
        threatReputation,
      });
    } catch (error) {
      console.error("Unable to save analysis:", error.message);
    }

    return res.status(200).json({
      success: true,

      result: {
        ...result,
        domainIntelligence,
        threatReputation,
        analysisId: savedAnalysis?._id || null,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to analyze content.",
    });
  }
});

app.get("/api/analyses", async (req, res) => {
  try {
    const analyses = await Analysis.find().sort({ createdAt: -1 }).limit(20);

    return res.status(200).json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error("History fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve analysis history.",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Cyber Shield server running on port ${PORT}`);
});
