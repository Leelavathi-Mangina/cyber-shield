"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [inputType, setInputType] = useState("message");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
            <option value="message">SMS / Message</option>
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
    </main>
  );
}
