"use client";

import { useState } from "react";

const TONES = [
  { id: "internal", label: "Internal", desc: "Casual, friendly team language" },
  { id: "internal-formal", label: "Internal (formal)", desc: "Professional but still internal-facing" },
  { id: "client", label: "Client facing", desc: "Polished, respectful business language" },
];

function tonePrompt(tone: string, dir: string): string {
  const jp = dir === "en-jp";
  const map: Record<string, string> = {
    internal: jp
      ? "Translate the following English text into Japanese using casual, friendly, internal team language (naturally conversational, like speaking to a colleague)."
      : "Translate the following Japanese text into English using casual, friendly, internal team language (naturally conversational, like speaking to a colleague).",
    "internal-formal": jp
      ? "Translate the following English text into Japanese using polite internal business language (丁寧語 level, professional but not overly stiff, appropriate for internal emails or documentation)."
      : "Translate the following Japanese text into English using polite, professional internal business language — formal but not stiff, appropriate for internal emails.",
    client: jp
      ? "Translate the following English text into Japanese using formal, respectful, client-facing business language (敬語/keigo, polished and professional, suitable for client emails and official communication)."
      : "Translate the following Japanese text into English using formal, polished, client-facing business language — professional and respectful, suitable for client-facing communication.",
  };
  return map[tone];
}

async function callAPI(system: string, message: string): Promise<string> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, message }),
  });
  const data = await res.json();
  return data.text || "";
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ fontSize: 13, padding: "4px 10px" }}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function TranslatorTab() {
  const [dir, setDir] = useState("en-jp");
  const [tone, setTone] = useState("internal");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const from = dir === "en-jp" ? "English" : "Japanese";
  const to = dir === "en-jp" ? "Japanese" : "English";

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const system = tonePrompt(tone, dir) + " Return only the translation, no explanations or extra text.";
      setOutput(await callAPI(system, input));
    } catch {
      setOutput("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{from}</span>
        <button
          onClick={() => { setDir(d => d === "en-jp" ? "jp-en" : "en-jp"); setInput(""); setOutput(""); }}
          style={{ padding: "5px 12px", fontSize: 13 }}
        >
          ⇄ Swap
        </button>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{to}</span>
      </div>

      <div>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tone</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TONES.map(t => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: tone === t.id ? 500 : 400,
                background: tone === t.id ? "#e8f0fe" : "transparent",
                color: tone === t.id ? "#1a56db" : undefined,
                borderColor: tone === t.id ? "#93b4f8" : undefined,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{TONES.find(t => t.id === tone)?.desc}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 12, color: "#888" }}>{from}</p>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Enter ${from} text…`}
            style={{ height: 180 }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "#888" }}>{to}</p>
            {output && <CopyBtn text={output} />}
          </div>
          <div style={{
            height: 180, border: "0.5px solid #d0d0cc", borderRadius: 8,
            padding: "10px 12px", fontSize: 14, lineHeight: 1.6,
            color: output ? undefined : "#aaa", overflow: "auto", whiteSpace: "pre-wrap",
            background: "#f5f5f2",
          }}>
            {loading ? "Translating…" : output || "Translation will appear here…"}
          </div>
        </div>
      </div>

      <button
        onClick={translate}
        disabled={loading || !input.trim()}
        style={{ alignSelf: "flex-start", padding: "8px 20px", fontSize: 14, fontWeight: 500 }}
      >
        {loading ? "Translating…" : "Translate"}
      </button>
    </div>
  );
}

function PolisherTab() {
  const [input, setInput] = useState("");
  const [polished, setPolished] = useState("");
  const [changes, setChanges] = useState("");
  const [loading, setLoading] = useState(false);

  const polish = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setPolished(""); setChanges("");
    try {
      const system = `You are a Japanese language editor. When given a Japanese paragraph, you will:
1. Lightly polish it for clarity, naturalness, and correctness while preserving the original tone and voice.
2. Return your response in this exact JSON format with no markdown:
{"polished":"<polished Japanese text>","changes":"<concise English explanation of changes made, using line breaks to separate multiple points. If no changes were needed, say so.>"}`;
      const raw = await callAPI(system, input);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setPolished(parsed.polished || "");
      setChanges(parsed.changes || "");
    } catch {
      setPolished("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 12, color: "#888" }}>Original Japanese</p>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="日本語の文章をここに貼り付けてください…"
          style={{ height: 140, fontSize: 15, lineHeight: 1.7 }}
        />
      </div>

      <button
        onClick={polish}
        disabled={loading || !input.trim()}
        style={{ alignSelf: "flex-start", padding: "8px 20px", fontSize: 14, fontWeight: 500 }}
      >
        {loading ? "Polishing…" : "Polish paragraph"}
      </button>

      {(loading || polished) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: "#888" }}>Polished Japanese</p>
              {polished && <CopyBtn text={polished} />}
            </div>
            <div style={{
              border: "0.5px solid #d0d0cc", borderRadius: 8,
              padding: "12px 16px", fontSize: 15, lineHeight: 1.7,
              background: "#f5f5f2", whiteSpace: "pre-wrap", minHeight: 80,
              color: polished ? undefined : "#aaa",
            }}>
              {loading && !polished ? "Polishing…" : polished}
            </div>
          </div>

          {changes && (
            <div style={{ borderLeft: "2px solid #93b4f8", paddingLeft: 14 }}>
              <p style={{ fontSize: 12, color: "#1a56db", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Changes made
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "#555", whiteSpace: "pre-wrap" }}>
                {changes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TranslatorTool() {
  const [tab, setTab] = useState("translate");

  return (
    <div>
      <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid #d0d0cc", marginBottom: "1.5rem" }}>
        {[["translate", "Translator"], ["polish", "Paragraph polisher"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "8px 18px", fontSize: 14,
              fontWeight: tab === id ? 500 : 400,
              background: "transparent", border: "none",
              borderBottom: tab === id ? "2px solid #1a1a1a" : "2px solid transparent",
              borderRadius: 0,
              color: tab === id ? "#1a1a1a" : "#888",
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "translate" ? <TranslatorTab /> : <PolisherTab />}
    </div>
  );
}