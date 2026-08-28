const validationDataset = require("../data/validationDataset");
const { analyzeContent } = require("../services/riskEngine");

let tp = 0;
let tn = 0;
let fp = 0;
let fn = 0;

const results = [];

for (const testCase of validationDataset) {
  const result = analyzeContent(
    testCase.content,
    testCase.inputType
  );

  const predicted =
    result.riskLevel === "low"
      ? "safe"
      : "malicious";

  const correct = predicted === testCase.expected;

  if (
    testCase.expected === "malicious" &&
    predicted === "malicious"
  ) {
    tp++;
  } else if (
    testCase.expected === "safe" &&
    predicted === "safe"
  ) {
    tn++;
  } else if (
    testCase.expected === "safe" &&
    predicted === "malicious"
  ) {
    fp++;
  } else if (
    testCase.expected === "malicious" &&
    predicted === "safe"
  ) {
    fn++;
  }

  results.push({
    id: testCase.id,
    expected: testCase.expected,
    predicted,
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
    correct,
  });
}

const total = validationDataset.length;

const accuracy =
  total > 0
    ? ((tp + tn) / total) * 100
    : 0;

const precision =
  tp + fp > 0
    ? (tp / (tp + fp)) * 100
    : 0;

const recall =
  tp + fn > 0
    ? (tp / (tp + fn)) * 100
    : 0;

console.log("\n=== CYBER SHIELD PROTOTYPE VALIDATION ===\n");

console.table(results);

console.log("\nConfusion Matrix");
console.log("----------------");
console.log("True Positives :", tp);
console.log("True Negatives :", tn);
console.log("False Positives:", fp);
console.log("False Negatives:", fn);

console.log("\nMetrics");
console.log("-------");
console.log(`Accuracy : ${accuracy.toFixed(2)}%`);
console.log(`Precision: ${precision.toFixed(2)}%`);
console.log(`Recall   : ${recall.toFixed(2)}%`);

console.log(
  "\nNote: These results are from a small prototype validation set and should not be presented as real-world production accuracy."
);