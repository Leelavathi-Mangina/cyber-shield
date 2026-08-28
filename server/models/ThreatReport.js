const mongoose = require("mongoose");

const threatReportSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },

    threatType: {
      type: String,
      enum: [
        "phishing",
        "scam",
        "fake-website",
        "qr-scam",
        "impersonation",
        "other",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["reported", "reviewing", "verified"],
      default: "reported",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ThreatReport",
  threatReportSchema
);