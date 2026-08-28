const validationDataset = [
  // =========================
  // BENIGN MESSAGES
  // =========================

  {
    id: 1,
    inputType: "message",
    content: "Hi, our project meeting is tomorrow at 3 PM.",
    expected: "safe",
  },

  {
    id: 2,
    inputType: "message",
    content: "Your class timetable has been updated for tomorrow.",
    expected: "safe",
  },

  {
    id: 3,
    inputType: "message",
    content: "Happy birthday! Hope you have a wonderful day.",
    expected: "safe",
  },

  {
    id: 4,
    inputType: "message",
    content: "Please submit the assignment before Friday.",
    expected: "safe",
  },

  {
    id: 5,
    inputType: "message",
    content: "Dinner will be served at 8 PM tonight.",
    expected: "safe",
  },

  // =========================
  // SCAM-LIKE MESSAGES
  // =========================

  {
    id: 6,
    inputType: "message",
    content:
      "URGENT! Your bank account has been blocked. Send your OTP immediately to verify your account.",
    expected: "malicious",
  },

  {
    id: 7,
    inputType: "message",
    content:
      "Congratulations! You won a cash prize. Pay the processing fee now to claim your reward.",
    expected: "malicious",
  },

  {
    id: 8,
    inputType: "message",
    content:
      "Your account will be suspended. Verify your password immediately.",
    expected: "malicious",
  },

  {
    id: 9,
    inputType: "message",
    content:
      "You have won a free reward. Click now and provide your PIN to claim it.",
    expected: "malicious",
  },

  {
    id: 10,
    inputType: "message",
    content:
      "Immediate payment required. Send your bank details to avoid account suspension.",
    expected: "malicious",
  },
];

module.exports = validationDataset;