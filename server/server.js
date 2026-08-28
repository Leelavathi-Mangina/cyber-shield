const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { analyzeContent } = require("./services/riskEngine");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cyber Shield API is running",
  });
});

app.post("/api/analyze", (req, res) => {
  try {
    const { content, inputType = "message" } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required for analysis.",
      });
    }

    const result = analyzeContent(content.trim(), inputType);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to analyze content.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Cyber Shield server running on port ${PORT}`);
});