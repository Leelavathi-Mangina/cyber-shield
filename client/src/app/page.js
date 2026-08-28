"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [inputType, setInputType] = useState("message");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [qrFile, setQrFile] = useState(null);
  const [qrResult, setQrResult] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [reportContent, setReportContent] = useState("");
  const [reportType, setReportType] = useState("phishing");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  async function handleAnalyze(e) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter suspicious content to analyze.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputType,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed.");
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message || "Unable to connect to Cyber Shield server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQrAnalyze(e) {
    e.preventDefault();

    if (!qrFile) {
      setQrError("Please select a QR image.");
      return;
    }

    try {
      setQrLoading(true);
      setQrError("");
      setQrResult(null);

      const formData = new FormData();
      formData.append("qrImage", qrFile);

      const response = await fetch("http://localhost:5000/api/qr/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "QR analysis failed.");
      }

      setQrResult(data);
    } catch (error) {
      setQrError(error.message || "Unable to analyze QR code.");
    } finally {
      setQrLoading(false);
    }
  }

  async function loadHistory() {
    try {
      setHistoryLoading(true);

      const response = await fetch("http://localhost:5000/api/analyses");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load history.");
      }

      setHistory(data.analyses || []);
    } catch (error) {
      console.error("History error:", error.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleThreatReport(event) {
    event.preventDefault();

    if (!reportContent.trim()) {
      setReportMessage("Please enter the suspicious content.");
      return;
    }

    try {
      setReportLoading(true);
      setReportMessage("");

      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          content: reportContent,
          threatType: reportType,
          description: reportDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit report.");
      }

      setReportMessage(
        `Threat reported successfully. Report ID: ${data.report.id}`,
      );

      setReportContent("");
      setReportDescription("");
      setReportType("phishing");
    } catch (error) {
      setReportMessage(error.message);
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Team ThinkForge
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl">Cyber Shield</h1>

          <p className="mt-4 text-lg text-slate-300">
            Detect. Understand. Stay Safe.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Analyze suspicious URLs, messages and emails to understand possible
            scam indicators and receive safer next-step recommendations.
          </p>
        </div>

        <form
          onSubmit={handleAnalyze}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          <label className="mb-2 block font-medium">Content Type</label>

          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
          >
            <option value="message">SMS / Social Media Message</option>
            <option value="email">Email</option>
            <option value="url">URL</option>
          </select>

          <label className="mb-2 block font-medium">Suspicious Content</label>

          <textarea
            rows="7"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste a suspicious message, email or URL here..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 outline-none focus:border-cyan-500"
          />

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Risk"}
          </button>
        </form>

        {result && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Risk Classification</p>

                <h2 className="text-3xl font-bold uppercase">
                  {result.riskLevel} Risk
                </h2>
              </div>

              <div className="rounded-xl bg-slate-800 px-5 py-3 text-center">
                <p className="text-sm text-slate-400">Risk Score</p>
                <p className="text-2xl font-bold">{result.riskScore}/100</p>
              </div>
            </div>

            {result.urlIntelligence?.metadata && (
              <div className="mb-6">
                <h3 className="mb-3 text-xl font-semibold">URL Intelligence</h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-800 p-3">
                    <p className="text-sm text-slate-400">Hostname</p>
                    <p className="break-all font-medium">
                      {result.urlIntelligence.metadata.hostname}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800 p-3">
                    <p className="text-sm text-slate-400">Protocol</p>
                    <p className="font-medium uppercase">
                      {result.urlIntelligence.metadata.protocol}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800 p-3">
                    <p className="text-sm text-slate-400">Subdomains</p>
                    <p className="font-medium">
                      {result.urlIntelligence.metadata.subdomainCount}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800 p-3">
                    <p className="text-sm text-slate-400">URL Length</p>
                    <p className="font-medium">
                      {result.urlIntelligence.metadata.urlLength}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result.evidence?.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-xl font-semibold">
                  Detected Evidence
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  {result.evidence.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                        {item.category}
                      </p>

                      <p className="mt-2 text-lg font-semibold text-white">
                        “{item.matchedText}”
                      </p>

                      <p className="mt-2 text-sm text-slate-300">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="mb-3 text-xl font-semibold">
                Why was this flagged?
              </h3>

              {result.detectedSignals.length > 0 ? (
                <ul className="space-y-2">
                  {result.detectedSignals.map((signal, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-slate-800 p-3 text-slate-200"
                    >
                      ⚠ {signal}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">
                  No major suspicious patterns were detected by the current
                  analysis.
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-xl font-semibold">
                Recommended Actions
              </h3>

              <ul className="space-y-2">
                {result.recommendations.map((item, index) => (
                  <li
                    key={index}
                    className="rounded-lg bg-slate-800 p-3 text-slate-200"
                  >
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold">QR Scam Analyzer</h2>

        <p className="mt-2 text-slate-400">
          Upload a QR-code image to inspect its hidden URL or text before
          opening it.
        </p>

        <form onSubmit={handleQrAnalyze} className="mt-5">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setQrFile(e.target.files?.[0] || null)}
            className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
          />

          {qrError && <p className="mt-3 text-sm text-red-400">{qrError}</p>}

          <button
            type="submit"
            disabled={qrLoading}
            className="mt-4 w-full rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {qrLoading ? "Analyzing QR..." : "Analyze QR"}
          </button>
        </form>

        {qrResult && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Decoded Content</p>

              <p className="mt-1 break-all font-medium">
                {qrResult.decodedContent}
              </p>
            </div>

            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Detected Type</p>

              <p className="mt-1 font-semibold uppercase">
                {qrResult.detectedType}
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 p-4">
              <p className="text-sm text-slate-400">Risk Classification</p>

              <p className="mt-1 text-2xl font-bold uppercase">
                {qrResult.result.riskLevel} Risk
              </p>

              <p className="mt-1 text-slate-300">
                Risk Score: {qrResult.result.riskScore}/100
              </p>
            </div>

            {qrResult.result.detectedSignals?.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Why was it flagged?
                </h3>

                <ul className="space-y-2">
                  {qrResult.result.detectedSignals.map((signal, index) => (
                    <li key={index} className="rounded-lg bg-slate-800 p-3">
                      ⚠ {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Recommended Actions
              </h3>

              <ul className="space-y-2">
                {qrResult.result.recommendations.map((item, index) => (
                  <li key={index} className="rounded-lg bg-slate-800 p-3">
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Report a Threat</h2>

          <p className="mt-2 text-slate-400">
            Report suspicious digital content for review and threat tracking.
          </p>
        </div>

        <form onSubmit={handleThreatReport} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Threat Type
            </label>

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
              <option value="phishing">Phishing</option>

              <option value="scam">Scam Message</option>

              <option value="fake-website">Fake Website</option>

              <option value="qr-scam">QR Scam</option>

              <option value="impersonation">Brand Impersonation</option>

              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Suspicious Content
            </label>

            <textarea
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder="Paste suspicious URL, message, email, or QR-decoded content..."
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Additional Information
            </label>

            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Why do you believe this is suspicious? (optional)"
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
          </div>

          <button
            type="submit"
            disabled={reportLoading}
            className="rounded-lg bg-cyan-600 px-5 py-3 font-semibold hover:bg-cyan-500 disabled:opacity-60"
          >
            {reportLoading ? "Submitting..." : "Report Threat"}
          </button>
        </form>

        {reportMessage && (
          <div className="mt-4 rounded-lg bg-slate-800 p-3 text-sm">
            {reportMessage}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Cyber Safety Awareness</h2>

          <p className="mt-2 text-slate-400">
            Quick guidance to help users recognize and respond to common cyber
            threats.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-800 p-5">
            <h3 className="text-lg font-semibold">Phishing Warning Signs</h3>

            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Urgent pressure to act immediately</li>
              <li>• Requests for OTP, password, PIN or CVV</li>
              <li>• Suspicious or shortened links</li>
              <li>• Unexpected prizes, refunds or payment requests</li>
              <li>• Messages pretending to be trusted organizations</li>
            </ul>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <h3 className="text-lg font-semibold">Safe Browsing Practices</h3>

            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                • Open official websites directly instead of message links
              </li>
              <li>• Verify the sender through an official channel</li>
              <li>• Never share OTPs or passwords</li>
              <li>• Inspect QR-code destinations before opening them</li>
              <li>• Report suspicious content when possible</li>
            </ul>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <h3 className="text-lg font-semibold">QR Scam Safety</h3>

            <p className="mt-3 text-sm text-slate-300">
              A QR code can hide a destination URL. Avoid scanning unknown QR
              codes directly. Analyze the QR first and inspect the destination
              before opening it.
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <h3 className="text-lg font-semibold">If You Suspect Fraud</h3>

            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Stop interacting with the suspicious content</li>
              <li>• Do not send money or sensitive information</li>
              <li>• Contact the organization through official channels</li>
              <li>• Change exposed credentials if necessary</li>
              <li>• Preserve evidence and report the incident appropriately</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Recent Analyses</h2>

            <p className="mt-1 text-slate-400">
              Review recently analyzed suspicious content.
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={historyLoading}
            className="rounded-lg border border-slate-700 px-4 py-2 font-medium hover:border-cyan-500 disabled:opacity-60"
          >
            {historyLoading ? "Loading..." : "Load History"}
          </button>
        </div>

        {history.length > 0 && (
          <div className="mt-5 space-y-3">
            {history.map((item) => (
              <div key={item._id} className="rounded-lg bg-slate-800 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold uppercase">{item.inputType}</p>

                  <p className="text-sm font-semibold uppercase">
                    {item.riskLevel} — {item.riskScore}/100
                  </p>
                </div>

                <p className="mt-3 break-all text-sm text-slate-300">
                  {item.inputContent}
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
