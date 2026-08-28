const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    matchedText: String,
    category: String,
    explanation: String,
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    inputType: {
      type: String,
      enum: ["message", "email", "url", "qr"],
      required: true,
    },

    inputContent: {
      type: String,
      required: true,
    },

    riskScore: {
      type: Number,
      required: true,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    detectedSignals: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    evidence: {
      type: [evidenceSchema],
      default: [],
    },

    domainIntelligence: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    threatReputation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);