const express = require("express");
const multer = require("multer");
const { Jimp } = require("jimp");
const QrCode = require("qrcode-reader");

const { analyzeContent } = require("../services/riskEngine");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/analyze", upload.single("qrImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "QR image is required.",
      });
    }

    const image = await Jimp.read(req.file.buffer);

    const qr = new QrCode();

    const decodedContent = await new Promise((resolve, reject) => {
      qr.callback = (error, value) => {
        if (error || !value?.result) {
          reject(new Error("Unable to decode QR code."));
          return;
        }

        resolve(value.result);
      };

      qr.decode(image.bitmap);
    });

    const looksLikeUrl =
      /^https?:\/\//i.test(decodedContent) ||
      /^[a-z0-9.-]+\.[a-z]{2,}/i.test(decodedContent);

    const inputType = looksLikeUrl ? "url" : "message";

    const result = analyzeContent(decodedContent, inputType);

    return res.status(200).json({
      success: true,
      decodedContent,
      detectedType: inputType,
      result,
    });
  } catch (error) {
    console.error("QR analysis error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to analyze QR code.",
    });
  }
});

module.exports = router;