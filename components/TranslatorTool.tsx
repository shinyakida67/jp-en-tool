"use client";
import { useState, useEffect } from "react";

type ToneId = "internal" | "internal-formal" | "client";
type Phrase = { jp: string; reading: string; en: string; tone: ToneId };
type CustomPhrase = Phrase & { id: string; category: string; createdAt: number };

// ── Responsive hook ───────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ── Data ──────────────────────────────────────────────────────────

const TONES: { id: ToneId; label: string; desc: string }[] = [
  { id: "internal",        label: "Internal",          desc: "Casual, friendly team language" },
  { id: "internal-formal", label: "Internal (formal)", desc: "Professional but still internal-facing" },
  { id: "client",          label: "Client facing",     desc: "Polished, respectful business language" },
];

const TONE_STYLE: Record<ToneId, { bg: string; color: string; border: string }> = {
  "internal":        { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  "internal-formal": { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  "client":          { bg: "#faf5ff", color: "#6b21a8", border: "#e9d5ff" },
};

const GLOSSARY: { id: string; name: string; phrases: Phrase[] }[] = [
  { id: "openers", name: "Email Openers", phrases: [
    { jp: "お疲れ様です",                       reading: "Otsukare-sama desu",                        en: "General internal greeting — 'Thanks for your hard work'",                tone: "internal" },
    { jp: "お世話になっております",              reading: "Osewa ni natte orimasu",                    en: "Standard client opening — 'Thank you for your continued support'",       tone: "client" },
    { jp: "いつもお世話になっております",        reading: "Itsumo osewa ni natte orimasu",             en: "Warmer client opening for established relationships",                     tone: "client" },
    { jp: "平素より大変お世話になっております",  reading: "Heiso yori taihen osewa ni natte orimasu", en: "Very formal client opening for official correspondence",                  tone: "client" },
  ]},
  { id: "closers", name: "Email Closers", phrases: [
    { jp: "よろしくお願いします",               reading: "Yoroshiku onegaishimasu",                   en: "Standard internal closer — 'Best regards / Please take care of this'",   tone: "internal" },
    { jp: "よろしくお願いいたします",           reading: "Yoroshiku onegai itashimasu",               en: "Polite closer for internal formal emails",                               tone: "internal-formal" },
    { jp: "何卒よろしくお願い申し上げます",     reading: "Nanitozo yoroshiku onegai moushiagemasu",   en: "Formal client closer — 'We sincerely look forward to your continued support'", tone: "client" },
    { jp: "引き続きよろしくお願いいたします",   reading: "Hikitsuzuki yoroshiku onegai itashimasu",   en: "Client closer for ongoing relationships",                                 tone: "client" },
  ]},
  { id: "requests", name: "Making Requests", phrases: [
    { jp: "〜してもらえますか？",               reading: "~ shite moraemasu ka?",                     en: "Casual request — 'Can you do ~?'",                                       tone: "internal" },
    { jp: "〜していただけますか？",             reading: "~ shite itadakemasu ka?",                   en: "Polite request — 'Could you please ~?'",                                 tone: "internal-formal" },
    { jp: "〜していただけますでしょうか？",     reading: "~ shite itadakemasu deshou ka?",            en: "Formal client request — 'Would you kindly ~?'",                          tone: "client" },
    { jp: "ご確認いただけますでしょうか？",     reading: "Gokakunin itadakemasu deshou ka?",          en: "Asking a client to review or confirm something",                         tone: "client" },
  ]},
  { id: "gratitude", name: "Expressing Gratitude", phrases: [
    { jp: "ありがとうございます",               reading: "Arigatou gozaimasu",                        en: "Thank you (general, polite)",                                            tone: "internal" },
    { jp: "ありがとうございました",             reading: "Arigatou gozaimashita",                     en: "Thank you for what you did (past tense, more formal)",                   tone: "internal-formal" },
    { jp: "誠にありがとうございます",           reading: "Makoto ni arigatou gozaimasu",              en: "Sincerely thank you — formal client gratitude",                          tone: "client" },
    { jp: "ご対応いただきありがとうございます", reading: "Go-taiou itadaki arigatou gozaimasu",       en: "Thank you for handling or responding to this",                           tone: "client" },
  ]},
  { id: "apologies", name: "Apologies", phrases: [
    { jp: "すみません",                         reading: "Sumimasen",                                 en: "Sorry / Excuse me (casual internal)",                                    tone: "internal" },
    { jp: "申し訳ありません",                   reading: "Moushiwake arimasen",                       en: "I sincerely apologize (formal)",                                         tone: "internal-formal" },
    { jp: "大変申し訳ございません",             reading: "Taihen moushiwake gozaimasen",              en: "We deeply apologize — formal client apology",                            tone: "client" },
    { jp: "ご迷惑をおかけして申し訳ございません", reading: "Go-meiwaku wo okake shite moushiwake gozaimasen", en: "We apologize for the inconvenience caused",                  tone: "client" },
  ]},
  { id: "confirmations", name: "Confirmations", phrases: [
    { jp: "わかりました",                       reading: "Wakarimashita",                             en: "Understood / Got it (casual internal)",                                  tone: "internal" },
    { jp: "承知しました",                       reading: "Shouchi shimashita",                        en: "Understood / I will take care of it (formal)",                          tone: "internal-formal" },
    { jp: "かしこまりました",                   reading: "Kashikomarimashita",                        en: "Certainly / As you wish (formal client)",                               tone: "client" },
    { jp: "ご連絡いただき、ありがとうございます", reading: "Go-renraku itadaki, arigatou gozaimasu", en: "Thank you for reaching out",                                             tone: "client" },
  ]},
  { id: "scheduling", name: "Meetings & Scheduling", phrases: [
    { jp: "都合はいかがでしょうか？",           reading: "Tsugou wa ikaga deshou ka?",               en: "How is your availability? (internal)",                                   tone: "internal" },
    { jp: "ご都合はいかがでしょうか？",         reading: "Go-tsugou wa ikaga deshou ka?",            en: "How is your availability? (client)",                                     tone: "client" },
    { jp: "下記の日程でいかがでしょうか？",     reading: "Kaki no nittei de ikaga deshou ka?",       en: "How does the following schedule work for you?",                          tone: "client" },
    { jp: "ご確認のほど、よろしくお願いいたします", reading: "Go-kakunin no hodo, yoroshiku onegai itashimasu", en: "Please review and confirm at your convenience",             tone: "client" },
  ]},
  { id: "followup", name: "Following Up", phrases: [
    { jp: "確認なのですが",                     reading: "Kakunin na no desu ga",                    en: "Just checking / Following up on... (internal)",                          tone: "internal" },
    { jp: "ご確認いただけましたでしょうか？",   reading: "Go-kakunin itadakemashita deshou ka?",     en: "Have you had a chance to review this?",                                  tone: "internal-formal" },
    { jp: "先日はお時間をいただきありがとうございました", reading: "Senjitsu wa ojikan wo itadaki arigatou gozaimashita", en: "Thank you for your time the other day",         tone: "client" },
    { jp: "ご検討の進捗はいかがでしょうか？",   reading: "Go-kentou no shinchoku wa ikaga deshou ka?", en: "How is the consideration or review progressing?",                    tone: "client" },
  ]},
];

const SUGGESTED: Record<ToneId, { opener: Phrase; closer: Phrase }> = {
  "internal":        { opener: GLOSSARY[0].phrases[0], closer: GLOSSARY[1].phrases[0] },
  "internal-formal": { opener: GLOSSARY[0].phrases[0], closer: GLOSSARY[1].phrases[1] },
  "client":          { opener: GLOSSARY[0].phrases[1], closer: GLOSSARY[1].phrases[2] },
};

const CATEGORY_OPTIONS = GLOSSARY.map(c => ({ id: c.id, name: c.name }));

// ── Prompts ───────────────────────────────────────────────────────

function tonePrompt(tone: ToneId, dir: string): string {
  const jp = dir === "en-jp";
  const map: Record<ToneId, string> = {
    "internal":        jp ? "Translate the following English text into Japanese using casual, friendly, internal team language."                              : "Translate the following Japanese text into English using casual, friendly, internal team language.",
    "internal-formal": jp ? "Translate the following English text into Japanese using polite internal business language (丁寧語 level, professional but not overly stiff)." : "Translate the following Japanese text into English using polite, professional internal business language.",
    "client":          jp ? "Translate the following English text into Japanese using formal, respectful, client-facing business language (敬語/keigo)."     : "Translate the following Japanese text into English using formal, polished, client-facing business language.",
  };
  return map[tone];
}

function polishSystemPrompt(tone: ToneId): string {
  const inst: Record<ToneId, string> = {
    "internal":        "casual, friendly internal team language. Opener if email: 「お疲れ様です」. Closer: 「よろしくお願いします」.",
    "internal-formal": "polite internal business language (丁寧語). Opener if email: 「お疲れ様です」. Closer: 「よろしくお願いいたします」.",
    "client":          "formal keigo (敬語) for client-facing communication. Opener if email: 「お世話になっております」. Closer: 「何卒よろしくお願い申し上げます」.",
  };
  return `You are a Japanese language editor specialising in business communication. Tone: ${inst[tone]}
Polish the given Japanese text for clarity, naturalness, and correctness while preserving the writer's intent. Ensure tone matches the level. If it looks like an email and is missing a standard opener or closer for the tone, add them.
Return ONLY this JSON, no markdown:
{"polished":"<polished text>","changes":"<English explanation of each change, one per line. If nothing changed, say so.>"}`;
}

// ── API ───────────────────────────────────────────────────────────

async function callAPI(system: string, message: string): Promise<string> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, message }),
  });
  const data = await res.json();
  return data.text || "";
}

// ── Shared components ─────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{ fontSize: 13, padding: "4px 10px" }}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function ToneSelector({ tone, setTone }: { tone: ToneId; setTone: (t: ToneId) => void }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tone</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TONES.map(t => (
          <button key={t.id} onClick={() => setTone(t.id)} style={{ padding: "6px 14px", fontSize: 13, fontWeight: tone === t.id ? 500 : 400, background: tone === t.id ? TONE_STYLE[t.id].bg : "transparent", color: tone === t.id ? TONE_STYLE[t.id].color : undefined, borderColor: tone === t.id ? TONE_STYLE[t.id].border : undefined }}>
            {t.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{TONES.find(t => t.id === tone)?.desc}</p>
    </div>
  );
}

function SuggestedPhrases({ tone }: { tone: ToneId }) {
  const isMobile = useIsMobile();
  const { opener, closer } = SUGGESTED[tone];
  return (
    <div style={{ marginTop: 4, borderTop: "0.5px solid #e5e5e0", paddingTop: 16 }}>
      <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Suggested phrases for this tone</p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
        {[{ label: "Opener", phrase: opener }, { label: "Closer", phrase: closer }].map(({ label, phrase }) => (
          <div key={label} style={{ border: "0.5px solid #e5e5e0", borderRadius: 8, padding: "10px 12px", background: "#fafaf8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              <CopyBtn text={phrase.jp} />
            </div>
            <p style={{ fontSize: 15, marginBottom: 2 }}>{phrase.jp}</p>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>{phrase.reading}</p>
            <p style={{ fontSize: 12, color: "#aaa" }}>{phrase.en}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phrase Card ───────────────────────────────────────────────────

function PhraseCard({ phrase, isFav, onToggleFav, onDelete }: {
  phrase: Phrase & { id?: string };
  isFav: boolean;
  onToggleFav: (jp: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div style={{ border: "0.5px solid #e5e5e0", borderRadius: 8, padding: "10px 14px", background: "#fafaf8", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15 }}>{phrase.jp}</span>
          <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, background: TONE_STYLE[phrase.tone].bg, color: TONE_STYLE[phrase.tone].color, border: `0.5px solid ${TONE_STYLE[phrase.tone].border}`, whiteSpace: "nowrap" }}>
            {TONES.find(t => t.id === phrase.tone)?.label}
          </span>
          {phrase.id && <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, background: "#fff8e6", color: "#92400e", border: "0.5px solid #fde68a", whiteSpace: "nowrap" }}>My phrase</span>}
        </div>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>{phrase.reading}</p>
        <p style={{ fontSize: 13, color: "#555" }}>{phrase.en}</p>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => onToggleFav(phrase.jp)} style={{ fontSize: 17, border: "none", background: "transparent", color: isFav ? "#f59e0b" : "#ccc", padding: "2px 4px", cursor: "pointer" }}>
          {isFav ? "★" : "☆"}
        </button>
        <CopyBtn text={phrase.jp} />
        {phrase.id && onDelete && (
          <button onClick={() => onDelete(phrase.id!)} style={{ fontSize: 12, color: "#ef4444", borderColor: "#fecaca", padding: "4px 8px" }}>Remove</button>
        )}
      </div>
    </div>
  );
}

// ── Add Phrase Form ───────────────────────────────────────────────

function AddPhraseForm({ onAdd }: { onAdd: (p: CustomPhrase) => void }) {
  const isMobile = useIsMobile();
  const [open, setOpen]       = useState(false);
  const [jp, setJp]           = useState("");
  const [reading, setReading] = useState("");
  const [en, setEn]           = useState("");
  const [tone, setTone]       = useState<ToneId>("internal");
  const [category, setCat]    = useState("openers");
  const [loading, setLoading] = useState(false);
  const [ready, setReady]     = useState(false);

  const suggest = async () => {
    if (!jp.trim()) return;
    setLoading(true); setReady(false);
    try {
      const system = `You are a Japanese language expert. Analyse the Japanese phrase and return ONLY this JSON with no markdown:
{"reading":"<romanised reading>","en":"<English meaning and usage context, one sentence>","tone":"<one of: internal, internal-formal, client>","category":"<one of: openers, closers, requests, gratitude, apologies, confirmations, scheduling, followup>"}`;
      const raw = await callAPI(system, jp);
      const p = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setReading(p.reading || ""); setEn(p.en || "");
      setTone((p.tone as ToneId) || "internal");
      setCat(p.category || "openers");
      setReady(true);
    } catch { setReady(true); }
    setLoading(false);
  };

  const save = () => {
    if (!jp.trim() || !reading.trim() || !en.trim()) return;
    onAdd({ jp, reading, en, tone, category, id: Date.now().toString(), createdAt: Date.now() });
    setJp(""); setReading(""); setEn(""); setReady(false); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ alignSelf: "flex-start", padding: "7px 16px", fontSize: 13 }}>+ Add phrase</button>
  );

  return (
    <div style={{ border: "0.5px solid #d0d0cc", borderRadius: 10, padding: 16, background: "#fafaf8", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 500 }}>Add a phrase</p>
        <button onClick={() => setOpen(false)} style={{ border: "none", background: "transparent", fontSize: 18, color: "#888", lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row" }}>
        <input value={jp} onChange={e => setJp(e.target.value)} placeholder="Paste Japanese phrase…" style={{ fontSize: 15, flex: 1 }} />
        <button onClick={suggest} disabled={loading || !jp.trim()} style={{ padding: "8px 14px", fontSize: 13, whiteSpace: "nowrap" }}>
          {loading ? "Analysing…" : "Suggest →"}
        </button>
      </div>
      {ready && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
            <div>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Reading</p>
              <input value={reading} onChange={e => setReading(e.target.value)} placeholder="Romanised reading" />
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Category</p>
              <select value={category} onChange={e => setCat(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid #d0d0cc", fontSize: 14, background: "#fff", fontFamily: "inherit" }}>
                {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>English explanation</p>
            <input value={en} onChange={e => setEn(e.target.value)} placeholder="English meaning / usage note" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Tone</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{ padding: "5px 12px", fontSize: 13, fontWeight: tone === t.id ? 500 : 400, background: tone === t.id ? TONE_STYLE[t.id].bg : "transparent", color: tone === t.id ? TONE_STYLE[t.id].color : undefined, borderColor: tone === t.id ? TONE_STYLE[t.id].border : undefined }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={save} disabled={!jp.trim() || !reading.trim() || !en.trim()} style={{ alignSelf: "flex-start", padding: "8px 18px", fontSize: 14, fontWeight: 500 }}>
            Save to glossary
          </button>
        </>
      )}
    </div>
  );
}

// ── Glossary Tab ──────────────────────────────────────────────────

function GlossaryTab({ favourites, customPhrases, toggleFav, addPhrase, deletePhrase }: {
  favourites: Set<string>;
  customPhrases: CustomPhrase[];
  toggleFav: (jp: string) => void;
  addPhrase: (p: CustomPhrase) => void;
  deletePhrase: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const [tone, setTone]         = useState<ToneId | "all">("all");
  const [category, setCategory] = useState<string>("all");

  const sidebarItems: ({ id: string; label: string } | null)[] = [
    { id: "all",        label: "All phrases" },
    { id: "favourites", label: "★  Favourites" },
    { id: "my-phrases", label: "My phrases" },
    null,
    ...GLOSSARY.map(c => ({ id: c.id, label: c.name })),
  ];

  const toneFilters = [
    { id: "all" as const, label: "All tones" },
    ...TONES.map(t => ({ id: t.id, label: t.label })),
  ];

  const matchesTone = (p: Phrase) => tone === "all" || p.tone === tone;
  const allBuiltinAndCustom = (): (Phrase & { id?: string })[] => [
    ...GLOSSARY.flatMap(c => c.phrases),
    ...customPhrases,
  ];

  const content = (
    <div style={{ flex: 1, paddingLeft: isMobile ? 0 : 20, display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {toneFilters.map(f => (
          <button key={f.id} onClick={() => setTone(f.id)} style={{ padding: "5px 12px", fontSize: 12, borderRadius: 20, fontWeight: tone === f.id ? 500 : 400, background: tone === f.id && f.id !== "all" ? TONE_STYLE[f.id].bg : tone === f.id ? "#f0f0ec" : "transparent", color: tone === f.id && f.id !== "all" ? TONE_STYLE[f.id].color : undefined, borderColor: tone === f.id && f.id !== "all" ? TONE_STYLE[f.id].border : undefined }}>
            {f.label}
          </button>
        ))}
      </div>

      <AddPhraseForm onAdd={addPhrase} />

      {category === "favourites" && (() => {
        const phrases = allBuiltinAndCustom().filter(p => favourites.has(p.jp) && matchesTone(p));
        return phrases.length
          ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{phrases.map((p, i) => { const cp = p as CustomPhrase; return <PhraseCard key={cp.id || i} phrase={p} isFav={true} onToggleFav={toggleFav} onDelete={cp.id ? deletePhrase : undefined} />; })}</div>
          : <p style={{ fontSize: 13, color: "#aaa" }}>No favourites yet — click ★ on any phrase to save it here.</p>;
      })()}

      {(category === "all" || category === "my-phrases") && (() => {
        const phrases = customPhrases.filter(p => matchesTone(p));
        if (!phrases.length) return null;
        return (
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 10, paddingBottom: 6, borderBottom: "0.5px solid #e5e5e0" }}>My phrases</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phrases.map(p => <PhraseCard key={p.id} phrase={p} isFav={favourites.has(p.jp)} onToggleFav={toggleFav} onDelete={deletePhrase} />)}
            </div>
          </div>
        );
      })()}

      {category !== "favourites" && category !== "my-phrases" && (() => {
        const cats = category === "all" ? GLOSSARY : GLOSSARY.filter(c => c.id === category);
        return cats.map(cat => {
          const phrases = [
            ...cat.phrases.filter(matchesTone),
            ...customPhrases.filter(p => p.category === cat.id && matchesTone(p)),
          ];
          if (!phrases.length) return null;
          return (
            <div key={cat.id}>
              {category === "all" && <p style={{ fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 10, paddingBottom: 6, borderBottom: "0.5px solid #e5e5e0" }}>{cat.name}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {phrases.map((p, i) => { const cp = p as CustomPhrase; return <PhraseCard key={cp.id || i} phrase={p} isFav={favourites.has(p.jp)} onToggleFav={toggleFav} onDelete={cp.id ? deletePhrase : undefined} />; })}
              </div>
            </div>
          );
        });
      })()}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {sidebarItems.filter(Boolean).map((item) => {
            const i = item as { id: string; label: string };
            return (
              <button key={i.id} onClick={() => setCategory(i.id)} style={{ padding: "6px 14px", fontSize: 13, borderRadius: 20, whiteSpace: "nowrap", fontWeight: category === i.id ? 500 : 400, background: category === i.id ? "#f0f0ec" : "transparent", color: category === i.id ? "#1a1a1a" : "#888", border: "0.5px solid #d0d0cc", flexShrink: 0 }}>
                {i.label}
              </button>
            );
          })}
        </div>
        {content}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 0, minHeight: 480 }}>
      <div style={{ width: 170, flexShrink: 0, borderRight: "0.5px solid #e5e5e0", paddingRight: 6, paddingTop: 2 }}>
        {sidebarItems.map((item, i) =>
          !item
            ? <div key={i} style={{ height: "0.5px", background: "#e5e5e0", margin: "8px 6px" }} />
            : <button key={item.id} onClick={() => setCategory(item.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8, fontSize: 13, fontWeight: category === item.id ? 500 : 400, background: category === item.id ? "#f0f0ec" : "transparent", color: category === item.id ? "#1a1a1a" : "#888", border: "none", cursor: "pointer", marginBottom: 2 }}>
                {item.label}
              </button>
        )}
      </div>
      {content}
    </div>
  );
}

// ── Translator Tab ────────────────────────────────────────────────

function TranslatorTab() {
  const isMobile = useIsMobile();
  const [dir, setDir]     = useState("en-jp");
  const [tone, setTone]   = useState<ToneId>("internal");
  const [input, setInput] = useState("");
  const [output, setOut]  = useState("");
  const [loading, setLoading] = useState(false);
  const from = dir === "en-jp" ? "English" : "Japanese";
  const to   = dir === "en-jp" ? "Japanese" : "English";

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true); setOut("");
    try { setOut(await callAPI(tonePrompt(tone, dir) + " Return only the translation, no explanations.", input)); }
    catch { setOut("Something went wrong. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{from}</span>
        <button onClick={() => { setDir(d => d === "en-jp" ? "jp-en" : "en-jp"); setInput(""); setOut(""); }} style={{ padding: "5px 12px", fontSize: 13 }}>⇄ Swap</button>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{to}</span>
      </div>
      <ToneSelector tone={tone} setTone={setTone} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 12, color: "#888" }}>{from}</p>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={`Enter ${from} text…`} style={{ height: isMobile ? 120 : 180 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "#888" }}>{to}</p>
            {output && <CopyBtn text={output} />}
          </div>
          <div style={{ height: isMobile ? 120 : 180, border: "0.5px solid #d0d0cc", borderRadius: 8, padding: "10px 12px", fontSize: 14, lineHeight: 1.6, color: output ? undefined : "#aaa", overflow: "auto", whiteSpace: "pre-wrap", background: "#f5f5f2" }}>
            {loading ? "Translating…" : output || "Translation will appear here…"}
          </div>
        </div>
      </div>
      <button onClick={translate} disabled={loading || !input.trim()} style={{ alignSelf: "flex-start", padding: "8px 20px", fontSize: 14, fontWeight: 500 }}>
        {loading ? "Translating…" : "Translate"}
      </button>
      {output && !loading && <SuggestedPhrases tone={tone} />}
    </div>
  );
}

// ── Polisher Tab ──────────────────────────────────────────────────

function PolisherTab() {
  const [tone, setTone]     = useState<ToneId>("internal");
  const [input, setInput]   = useState("");
  const [polished, setPol]  = useState("");
  const [changes, setChg]   = useState("");
  const [loading, setLoading] = useState(false);

  const polish = async () => {
    if (!input.trim()) return;
    setLoading(true); setPol(""); setChg("");
    try {
      const raw = await callAPI(polishSystemPrompt(tone), input);
      const p = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setPol(p.polished || "");
      setChg(Array.isArray(p.changes) ? p.changes.join("\n") : String(p.changes || ""));
    } catch { setPol("Something went wrong. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <ToneSelector tone={tone} setTone={setTone} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 12, color: "#888" }}>Original Japanese</p>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="日本語の文章をここに貼り付けてください…" style={{ height: 140, fontSize: 15, lineHeight: 1.7 }} />
      </div>
      <button onClick={polish} disabled={loading || !input.trim()} style={{ alignSelf: "flex-start", padding: "8px 20px", fontSize: 14, fontWeight: 500 }}>
        {loading ? "Polishing…" : "Polish paragraph"}
      </button>
      {(loading || polished) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: "#888" }}>Polished Japanese</p>
              {polished && <CopyBtn text={polished} />}
            </div>
            <div style={{ border: "0.5px solid #d0d0cc", borderRadius: 8, padding: "12px 16px", fontSize: 15, lineHeight: 1.7, background: "#f5f5f2", whiteSpace: "pre-wrap", minHeight: 80, color: polished ? undefined : "#aaa" }}>
              {loading && !polished ? "Polishing…" : polished}
            </div>
          </div>
          {changes && (
            <div style={{ borderLeft: "2px solid #bfdbfe", paddingLeft: 14 }}>
              <p style={{ fontSize: 12, color: "#1e40af", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Changes made</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {changes.split("\n").filter(l => l.trim()).map((line, i) => (
                  <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.65, color: "#555" }}>
                    <span style={{ color: "#93c5fd", flexShrink: 0, marginTop: 1 }}>•</span>
                    <span>{line.replace(/^[-•*]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {polished && !loading && <SuggestedPhrases tone={tone} />}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

export default function TranslatorTool() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("translate");
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [customPhrases, setCustom]  = useState<CustomPhrase[]>([]);

  useEffect(() => {
    try {
      const favs = localStorage.getItem("jp-tool-favourites");
      if (favs) setFavourites(new Set(JSON.parse(favs)));
      const customs = localStorage.getItem("jp-tool-custom-phrases");
      if (customs) setCustom(JSON.parse(customs));
    } catch {}
  }, []);

  const toggleFav = (jp: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      next.has(jp) ? next.delete(jp) : next.add(jp);
      localStorage.setItem("jp-tool-favourites", JSON.stringify([...next]));
      return next;
    });
  };

  const addPhrase = (p: CustomPhrase) => {
    setCustom(prev => {
      const next = [...prev, p];
      localStorage.setItem("jp-tool-custom-phrases", JSON.stringify(next));
      return next;
    });
  };

  const deletePhrase = (id: string) => {
    setCustom(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem("jp-tool-custom-phrases", JSON.stringify(next));
      return next;
    });
  };

  const tabs = [["translate", "Translator"], ["polish", "Paragraph polisher"], ["glossary", "Glossary"]];

  return (
    <div>
      <div style={{ display: "flex", borderBottom: "0.5px solid #d0d0cc", marginBottom: "1.5rem", overflowX: isMobile ? "auto" : undefined }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 18px", fontSize: 14, fontWeight: tab === id ? 500 : 400, background: "transparent", border: "none", borderBottom: tab === id ? "2px solid #1a1a1a" : "2px solid transparent", borderRadius: 0, color: tab === id ? "#1a1a1a" : "#888", marginBottom: -1, whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>
      {tab === "translate" ? <TranslatorTab /> :
       tab === "polish"    ? <PolisherTab /> :
       <GlossaryTab favourites={favourites} customPhrases={customPhrases} toggleFav={toggleFav} addPhrase={addPhrase} deletePhrase={deletePhrase} />}
    </div>
  );
}