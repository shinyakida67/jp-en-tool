"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";

type ToneId = "internal" | "internal-formal" | "client";
type Phrase = { jp: string; reading: string; en: string; tone: ToneId };
type CustomPhrase = Phrase & { id: string; category: string; createdAt: number };

// ── Hooks ─────────────────────────────────────────────────────────

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

function useAutoGrowTextarea(value: string, minHeight: number, maxHeight: number) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState(minHeight);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${next}px`;
    setHeight(next);
  }, [value, minHeight, maxHeight]);
  return [ref, height] as const;
}

// ── Sheets API helpers ────────────────────────────────────────────

async function sheetsGet(action: string, user?: string) {
  const url = `/api/sheets?action=${action}${user ? `&user=${encodeURIComponent(user)}` : ""}`;
  const res = await fetch(url);
  return res.json();
}

async function sheetsPost(action: string, body: object) {
  const res = await fetch(`/api/sheets?action=${action}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return res.json();
}

async function sheetsDelete(action: string, body: object) {
  const res = await fetch(`/api/sheets?action=${action}`, {
    method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return res.json();
}

// ── Data ──────────────────────────────────────────────────────────

const TONES: { id: ToneId; label: string; desc: string }[] = [
  { id: "internal",        label: "Internal",          desc: "Casual, friendly team language" },
  { id: "internal-formal", label: "Internal (formal)", desc: "Professional but still internal-facing" },
  { id: "client",          label: "Client facing",     desc: "Polished, respectful business language" },
];

const TONE_STYLE: Record<ToneId, { bg: string; color: string; border: string }> = {
  "internal":        { bg: "var(--tone-internal-bg)", color: "var(--tone-internal-color)", border: "var(--tone-internal-border)" },
  "internal-formal": { bg: "var(--tone-formal-bg)",   color: "var(--tone-formal-color)",   border: "var(--tone-formal-border)" },
  "client":          { bg: "var(--tone-client-bg)",   color: "var(--tone-client-color)",   border: "var(--tone-client-border)" },
};

const GLOSSARY: { id: string; name: string; phrases: Phrase[] }[] = [
  { id: "openers", name: "Email Openers", phrases: [
    { jp: "お疲れ様です",                       reading: "Otsukare-sama desu",                        en: "General internal greeting — 'Thanks for your hard work'",                tone: "internal" },
    { jp: "お世話になっております",              reading: "Osewa ni natte orimasu",                    en: "Standard client opening — 'Thank you for your continued support'",       tone: "client" },
    { jp: "いつもお世話になっております",        reading: "Itsumo osewa ni natte orimasu",             en: "Warmer client opening for established relationships",                     tone: "client" },
    { jp: "平素より大変お世話になっております",  reading: "Heiso yori taihen osewa ni natte orimasu", en: "Very formal client opening for official correspondence",                  tone: "client" },
    { jp: "平素よりシステム運用にご協力いただきありがとうございます", reading: "Heiso yori shisutemu un'you ni go-kyouryoku itadaki arigatou gozaimasu", en: "Thank you for your continued cooperation with our system operations", tone: "client" },
  ]},
  { id: "closers", name: "Email Closers", phrases: [
    { jp: "よろしくお願いします",               reading: "Yoroshiku onegaishimasu",                   en: "Standard internal closer — 'Best regards / Please take care of this'",   tone: "internal" },
    { jp: "よろしくお願いいたします",           reading: "Yoroshiku onegai itashimasu",               en: "Polite closer for internal formal emails",                               tone: "internal-formal" },
    { jp: "何卒よろしくお願い申し上げます",     reading: "Nanitozo yoroshiku onegai moushiagemasu",   en: "Formal client closer — 'We sincerely look forward to your continued support'", tone: "client" },
    { jp: "引き続きよろしくお願いいたします",   reading: "Hikitsuzuki yoroshiku onegai itashimasu",   en: "Client closer for ongoing relationships",                                 tone: "client" },
    { jp: "ご不明な点がございましたら、お気軽にお問い合わせください", reading: "Go-fumeina ten ga gozaimashitara, o-ki-garu ni o-toiawase kudasai", en: "Please don't hesitate to contact us if you have any questions", tone: "client" },
    { jp: "引き続きサポートいたします",         reading: "Hikitsuzuki sapooto itashimasu",            en: "We will continue to provide support",                                     tone: "client" },
  ]},
  { id: "requests", name: "Making Requests", phrases: [
    { jp: "〜してもらえますか？",               reading: "~ shite moraemasu ka?",                     en: "Casual request — 'Can you do ~?'",                                       tone: "internal" },
    { jp: "〜していただけますか？",             reading: "~ shite itadakemasu ka?",                   en: "Polite request — 'Could you please ~?'",                                 tone: "internal-formal" },
    { jp: "〜していただけますでしょうか？",     reading: "~ shite itadakemasu deshou ka?",            en: "Formal client request — 'Would you kindly ~?'",                          tone: "client" },
    { jp: "ご確認いただけますでしょうか？",     reading: "Gokakunin itadakemasu deshou ka?",          en: "Asking a client to review or confirm something",                         tone: "client" },
    { jp: "仕様をご確認いただけますでしょうか？", reading: "Shiyou wo go-kakunin itadakemasu deshou ka?", en: "Could you please review the specifications?",                        tone: "client" },
    { jp: "ご承認をいただけますでしょうか？",   reading: "Go-shounin wo itadakemasu deshou ka?",      en: "Could we have your approval on this?",                                   tone: "client" },
    { jp: "テスト環境にてご確認いただけますでしょうか？", reading: "Tesuto kankyou nite go-kakunin itadakemasu deshou ka?", en: "Could you please check this in the test environment?", tone: "client" },
    { jp: "期日までにフィードバックをいただけますか？", reading: "Kijitsu made ni fidobakku wo itadakemasu ka?", en: "Could we receive your feedback by the deadline?",            tone: "internal" },
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
    { jp: "ご不便をおかけしております",         reading: "Go-fuben wo okake shite orimasu",           en: "We apologise for the inconvenience this is causing (system issues)",     tone: "client" },
    { jp: "システム障害によりご迷惑をおかけし、誠に申し訳ございません", reading: "Shisutemu shougai ni yori go-meiwaku wo okake shi, makoto ni moushiwake gozaimasen", en: "We sincerely apologise for the inconvenience caused by the system outage", tone: "client" },
    { jp: "対応が遅れており、申し訳ございません", reading: "Taiou ga okure te ori, moushiwake gozaimasen", en: "We apologise for the delay in our response",                      tone: "internal-formal" },
  ]},
  { id: "confirmations", name: "Confirmations", phrases: [
    { jp: "わかりました",                       reading: "Wakarimashita",                             en: "Understood / Got it (casual internal)",                                  tone: "internal" },
    { jp: "承知しました",                       reading: "Shouchi shimashita",                        en: "Understood / I will take care of it (formal)",                          tone: "internal-formal" },
    { jp: "かしこまりました",                   reading: "Kashikomarimashita",                        en: "Certainly / As you wish (formal client)",                               tone: "client" },
    { jp: "ご連絡いただき、ありがとうございます", reading: "Go-renraku itadaki, arigatou gozaimasu", en: "Thank you for reaching out",                                             tone: "client" },
    { jp: "対応いたします",                     reading: "Taiou itashimasu",                          en: "We will take care of this",                                             tone: "internal" },
    { jp: "確認次第、ご連絡いたします",         reading: "Kakunin shidai, go-renraku itashimasu",     en: "We will get back to you as soon as we have confirmed",                   tone: "client" },
    { jp: "現在調査中です",                     reading: "Genzai chousa-chuu desu",                   en: "We are currently investigating",                                         tone: "client" },
    { jp: "リリース完了しました",               reading: "Rirīsu kanryou shimashita",                 en: "The release has been completed",                                         tone: "internal" },
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
    { jp: "進捗をご共有いただけますでしょうか？", reading: "Shinchoku wo go-kyouyuu itadakemasu deshou ka?", en: "Could you share an update on the progress?",                  tone: "internal-formal" },
    { jp: "先日ご送付した提案書についてご確認いただけましたでしょうか？", reading: "Senjitsu go-soufu shita teiansho ni tsuite go-kakunin itadakemashita deshou ka?", en: "Have you had a chance to review the proposal we sent the other day?", tone: "client" },
    { jp: "本件、いつ頃までにご回答いただけますでしょうか？", reading: "Honken, itsu goro made ni go-kaitou itadakemasu deshou ka?", en: "By when can we expect a response on this matter?", tone: "client" },
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
    "internal":        jp ? "Translate the following English text into Japanese using natural, direct internal team language. Be clear and collegial — avoid vague or overly casual phrasing. Short messages should still feel considered and purposeful, not throwaway."
                          : "Translate the following Japanese text into English using natural, direct internal team language. Keep it collegial and clear — avoid vague or overly casual phrasing.",
    "internal-formal": jp ? "Translate the following English text into Japanese using polite but approachable internal business language (丁寧語). A clear step above casual — professional enough for a respected colleague or senior — but conversational enough that it doesn't feel stiff or distant."
                          : "Translate the following Japanese text into English using polite but approachable professional language. A clear step above casual, but conversational enough that it doesn't feel stiff. Think: a respected colleague you know well.",
    "client":          jp ? "Translate the following English text into Japanese using formal, respectful client-facing business language (敬語/keigo). Aim for a polished, modern business tone — professional and considerate, but not unnecessarily stiff or archaic."
                          : "Translate the following Japanese text into English using formal, polished client-facing business language. Keep it professional and respectful, but let it sound natural — avoid overly corporate or stilted phrasing where a cleaner expression works just as well.",
  };
  return map[tone];
}

function polishSystemPrompt(tone: ToneId): string {
  const inst: Record<ToneId, string> = {
    "internal":        "natural, direct internal team language — clear and collegial, not vague or slangy. Short messages should feel considered and purposeful. Opener if email: 「お疲れ様です」. Closer: 「よろしくお願いします」.",
    "internal-formal": "polite but approachable internal business language (丁寧語) — a clear step above casual, but conversational enough that it doesn't feel stiff or distant. Write as you would to a respected colleague you know well. Opener if email: 「お疲れ様です」. Closer: 「よろしくお願いいたします」.",
    "client":          "formal keigo (敬語) for client-facing communication, with a modern, natural business tone. Polished and respectful, but not unnecessarily archaic or stiff — allow for warmth where it fits naturally. Opener if email: 「お世話になっております」. Closer: 「何卒よろしくお願い申し上げます」.",
  };
  return `You are a Japanese language editor specialising in business communication. Tone: ${inst[tone]}
Polish the given Japanese text for clarity, naturalness, and correctness while preserving the writer's intent. Ensure tone matches the level. If it looks like an email and is missing a standard opener or closer for the tone, add them.
Return ONLY this JSON, no markdown:
{"polished":"<polished text>","changes":"<English explanation of each change, one per line. If nothing changed, say so.>"}`;
}

// ── Gemini API ────────────────────────────────────────────────────

async function callAPI(system: string, message: string): Promise<string> {
  const res = await fetch("/api/translate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, message }),
  });
  const data = await res.json();
  return data.text || "";
}

// ── User Picker ───────────────────────────────────────────────────

function UserPicker({ onSelect }: { onSelect: (name: string) => void }) {
  const [input, setInput]          = useState("");
  const [users, setUsers]          = useState<string[]>([]);
  const [showDrop, setShowDrop]    = useState(false);
  const [saving, setSaving]        = useState(false);
  const [loadingUsers, setLoading] = useState(true);

  useEffect(() => {
    sheetsGet("users")
      .then(d => { setUsers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered   = input.trim() ? users.filter(u => u.toLowerCase().includes(input.toLowerCase())) : users;
  const exactMatch = users.map(u => u.toLowerCase()).includes(input.trim().toLowerCase());
  const isNew      = input.trim() && !exactMatch;

  const select = async (name: string) => {
    setSaving(true);
    try {
      await sheetsPost("add-user", { name });
      localStorage.setItem("baymax-user", name);
      onSelect(name);
    } catch { setSaving(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 24, padding: "0 1rem" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--text-faint)", marginBottom: 6 }}>Welcome to Baymax</p>
        <h2 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)" }}>Who are you?</h2>
      </div>
      <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ position: "relative" }}>
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            placeholder={loadingUsers ? "Loading…" : "Type your name…"}
            disabled={loadingUsers || saving}
            style={{ fontSize: 15, textAlign: "center" }}
            autoFocus
          />
          {showDrop && filtered.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-input)", border: "0.5px solid var(--border)", borderRadius: 8, marginTop: 4, overflow: "hidden", zIndex: 10 }}>
              {filtered.slice(0, 8).map(name => (
                <button key={name} onMouseDown={() => select(name)} style={{ display: "block", width: "100%", textAlign: "center", padding: "10px 14px", fontSize: 14, border: "none", borderBottom: "0.5px solid var(--border-light)", borderRadius: 0, color: "var(--text-primary)" }}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        {exactMatch && (
          <button onClick={() => select(users.find(u => u.toLowerCase() === input.trim().toLowerCase())!)} disabled={saving} style={{ padding: "9px 20px", fontSize: 14, fontWeight: 500 }}>
            {saving ? "Loading…" : "Continue"}
          </button>
        )}
        {isNew && (
          <button onClick={() => select(input.trim())} disabled={saving} style={{ padding: "9px 20px", fontSize: 14, fontWeight: 500 }}>
            {saving ? "Setting up…" : `Join as "${input.trim()}"`}
          </button>
        )}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
        Select your name to load your data, or type a new name to join for the first time.
      </p>
    </div>
  );
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
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tone</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TONES.map(t => (
          <button key={t.id} onClick={() => setTone(t.id)} style={{ padding: "6px 14px", fontSize: 13, fontWeight: tone === t.id ? 500 : 400, background: tone === t.id ? TONE_STYLE[t.id].bg : "transparent", color: tone === t.id ? TONE_STYLE[t.id].color : "var(--text-primary)", borderColor: tone === t.id ? TONE_STYLE[t.id].border : "var(--border)" }}>
            {t.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{TONES.find(t => t.id === tone)?.desc}</p>
    </div>
  );
}

function SuggestedPhrases({ tone }: { tone: ToneId }) {
  const isMobile = useIsMobile();
  const { opener, closer } = SUGGESTED[tone];
  return (
    <div style={{ marginTop: 4, borderTop: "0.5px solid var(--border-light)", paddingTop: 16 }}>
      <p style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Suggested phrases for this tone</p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
        {[{ label: "Opener", phrase: opener }, { label: "Closer", phrase: closer }].map(({ label, phrase }) => (
          <div key={label} style={{ border: "0.5px solid var(--border-light)", borderRadius: 8, padding: "10px 12px", background: "var(--bg-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              <CopyBtn text={phrase.jp} />
            </div>
            <p style={{ fontSize: 15, marginBottom: 2, color: "var(--text-primary)" }}>{phrase.jp}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{phrase.reading}</p>
            <p style={{ fontSize: 12, color: "var(--text-faint)" }}>{phrase.en}</p>
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
    <div style={{ border: "0.5px solid var(--border-light)", borderRadius: 8, padding: "10px 14px", background: "var(--bg-card)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, color: "var(--text-primary)" }}>{phrase.jp}</span>
          <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, background: TONE_STYLE[phrase.tone].bg, color: TONE_STYLE[phrase.tone].color, border: `0.5px solid ${TONE_STYLE[phrase.tone].border}`, whiteSpace: "nowrap" }}>
            {TONES.find(t => t.id === phrase.tone)?.label}
          </span>
          {phrase.id && <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, background: "var(--custom-tag-bg)", color: "var(--custom-tag-color)", border: "0.5px solid var(--custom-tag-border)", whiteSpace: "nowrap" }}>My phrase</span>}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{phrase.reading}</p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{phrase.en}</p>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => onToggleFav(phrase.jp)} style={{ fontSize: 17, border: "none", background: "transparent", color: isFav ? "var(--star-active)" : "var(--text-faint)", padding: "2px 4px", cursor: "pointer" }}>
          {isFav ? "★" : "☆"}
        </button>
        <CopyBtn text={phrase.jp} />
        {phrase.id && onDelete && (
          <button onClick={() => onDelete(phrase.id!)} style={{ fontSize: 12, color: "var(--remove-color)", borderColor: "var(--remove-border)", padding: "4px 8px" }}>Remove</button>
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
      const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
      const p = JSON.parse(cleaned);
      setReading(p.reading || ""); setEn(p.en || "");
      setTone((p.tone as ToneId) || "internal"); setCat(p.category || "openers");
      setReady(true);
    } catch { setReady(true); }
    setLoading(false);
  };

  const save = () => {
    if (!jp.trim() || !reading.trim() || !en.trim()) return;
    onAdd({ jp, reading, en, tone, category, id: Date.now().toString(), createdAt: Date.now() });
    setJp(""); setReading(""); setEn(""); setReady(false); setOpen(false);
  };

  if (!open) return <button onClick={() => setOpen(true)} style={{ alignSelf: "flex-start", padding: "7px 16px", fontSize: 13 }}>+ Add phrase</button>;

  return (
    <div style={{ border: "0.5px solid var(--border)", borderRadius: 10, padding: 16, background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Add a phrase</p>
        <button onClick={() => setOpen(false)} style={{ border: "none", background: "transparent", fontSize: 18, color: "var(--text-muted)", lineHeight: 1 }}>✕</button>
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
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Reading</p>
              <input value={reading} onChange={e => setReading(e.target.value)} placeholder="Romanised reading" />
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Category</p>
              <select value={category} onChange={e => setCat(e.target.value)}>
                {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>English explanation</p>
            <input value={en} onChange={e => setEn(e.target.value)} placeholder="English meaning / usage note" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Tone</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{ padding: "5px 12px", fontSize: 13, fontWeight: tone === t.id ? 500 : 400, background: tone === t.id ? TONE_STYLE[t.id].bg : "transparent", color: tone === t.id ? TONE_STYLE[t.id].color : "var(--text-primary)", borderColor: tone === t.id ? TONE_STYLE[t.id].border : "var(--border)" }}>
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
  const [search, setSearch]     = useState("");

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
  const matchesSearch = (p: Phrase) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.jp.toLowerCase().includes(q) || p.reading.toLowerCase().includes(q) || p.en.toLowerCase().includes(q);
  };
  const matchesFilters = (p: Phrase) => matchesTone(p) && matchesSearch(p);
  const allBuiltinAndCustom = (): (Phrase & { id?: string })[] => [
    ...GLOSSARY.flatMap(c => c.phrases),
    ...customPhrases,
  ];

  // Total visible phrases — used to show a "no results" message when search yields nothing
  const totalVisible = (() => {
    if (category === "favourites") return allBuiltinAndCustom().filter(p => favourites.has(p.jp) && matchesFilters(p)).length;
    if (category === "my-phrases") return customPhrases.filter(matchesFilters).length;
    const cats = category === "all" ? GLOSSARY : GLOSSARY.filter(c => c.id === category);
    const builtinHits = cats.reduce((n, c) => n + c.phrases.filter(matchesFilters).length, 0);
    const customHits  = customPhrases.filter(p => (category === "all" || p.category === category) && matchesFilters(p)).length;
    return builtinHits + customHits;
  })();

  const content = (
    <div style={{ flex: 1, paddingLeft: isMobile ? 0 : 20, display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>
      <div style={{ position: "relative" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search phrases — Japanese, reading, or English…"
          style={{ fontSize: 13, paddingRight: search ? 32 : 12 }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
            style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "var(--text-faint)", fontSize: 14, padding: "2px 8px", borderRadius: 4 }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {toneFilters.map(f => (
          <button key={f.id} onClick={() => setTone(f.id)} style={{ padding: "5px 12px", fontSize: 12, borderRadius: 20, fontWeight: tone === f.id ? 500 : 400, background: tone === f.id && f.id !== "all" ? TONE_STYLE[f.id].bg : tone === f.id ? "var(--bg-hover)" : "transparent", color: tone === f.id && f.id !== "all" ? TONE_STYLE[f.id].color : "var(--text-primary)", borderColor: tone === f.id && f.id !== "all" ? TONE_STYLE[f.id].border : "var(--border)" }}>
            {f.label}
          </button>
        ))}
      </div>

      <AddPhraseForm onAdd={addPhrase} />

      {category === "favourites" && (() => {
        const phrases = allBuiltinAndCustom().filter(p => favourites.has(p.jp) && matchesFilters(p));
        if (phrases.length) return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{phrases.map((p, i) => { const cp = p as CustomPhrase; return <PhraseCard key={cp.id || i} phrase={p} isFav={true} onToggleFav={toggleFav} onDelete={cp.id ? deletePhrase : undefined} />; })}</div>;
        if (search.trim()) return null;
        return <p style={{ fontSize: 13, color: "var(--text-faint)" }}>No favourites yet — click ★ on any phrase to save it here.</p>;
      })()}

      {(category === "all" || category === "my-phrases") && (() => {
        const phrases = customPhrases.filter(matchesFilters);
        if (!phrases.length) return null;
        return (
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10, paddingBottom: 6, borderBottom: "0.5px solid var(--border-light)" }}>My phrases</p>
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
            ...cat.phrases.filter(matchesFilters),
            ...customPhrases.filter(p => p.category === cat.id && matchesFilters(p)),
          ];
          if (!phrases.length) return null;
          return (
            <div key={cat.id}>
              {category === "all" && <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10, paddingBottom: 6, borderBottom: "0.5px solid var(--border-light)" }}>{cat.name}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {phrases.map((p, i) => { const cp = p as CustomPhrase; return <PhraseCard key={cp.id || i} phrase={p} isFav={favourites.has(p.jp)} onToggleFav={toggleFav} onDelete={cp.id ? deletePhrase : undefined} />; })}
              </div>
            </div>
          );
        });
      })()}

      {search.trim() && totalVisible === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-faint)" }}>No phrases match &ldquo;{search}&rdquo; in this view.</p>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {sidebarItems.filter(Boolean).map(item => {
            const i = item as { id: string; label: string };
            return <button key={i.id} onClick={() => setCategory(i.id)} style={{ padding: "6px 14px", fontSize: 13, borderRadius: 20, whiteSpace: "nowrap", fontWeight: category === i.id ? 500 : 400, background: category === i.id ? "var(--bg-hover)" : "transparent", color: category === i.id ? "var(--text-primary)" : "var(--text-muted)", border: "0.5px solid var(--border)", flexShrink: 0 }}>{i.label}</button>;
          })}
        </div>
        {content}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 0, minHeight: 480 }}>
      <div style={{ width: 170, flexShrink: 0, borderRight: "0.5px solid var(--border-light)", paddingRight: 6, paddingTop: 2 }}>
        {sidebarItems.map((item, i) =>
          !item
            ? <div key={i} style={{ height: "0.5px", background: "var(--border-light)", margin: "8px 6px" }} />
            : <button key={item.id} onClick={() => setCategory(item.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8, fontSize: 13, fontWeight: category === item.id ? 500 : 400, background: category === item.id ? "var(--bg-hover)" : "transparent", color: category === item.id ? "var(--text-primary)" : "var(--text-muted)", border: "none", cursor: "pointer", marginBottom: 2 }}>
                {item.label}
              </button>
        )}
      </div>
      {content}
    </div>
  );
}

// ── Baymax Loader ─────────────────────────────────────────────────

function BaymaxLoader() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            width: 26,
            height: 18,
            borderRadius: "50% 50% 44% 44%",
            background: "#ffffff",
            border: "0.5px solid var(--border)",
            position: "relative",
            flexShrink: 0,
            animation: "baymax-waddle 0.6s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
            animationFillMode: "backwards",
          }}
        >
          <svg
            viewBox="0 0 26 18"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            {/* Eyes — just above centre, slightly wide apart */}
            <circle cx="8"  cy="7" r="1.5" fill="#1a1a1a" />
            <circle cx="18" cy="7" r="1.5" fill="#1a1a1a" />
            {/* Faint smile connecting inner edges of eyes */}
            <path
              d="M 9.5 8.5 Q 13 11 16.5 8.5"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.35"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ── Translator Tab ────────────────────────────────────────────────

type TranslationNote = { category: string; original: string; explanation: string };

function TranslatorTab() {
  const isMobile = useIsMobile();
  const [dir, setDir]         = useState("en-jp");
  const [tone, setTone]       = useState<ToneId>("internal");
  const [input, setInput]     = useState("");
  const [output, setOut]      = useState("");
  const [hiragana, setHira]   = useState("");
  const [romaji, setRoma]     = useState("");
  const [notes, setNotes]     = useState<TranslationNote[]>([]);
  const [showHira, setShowHira] = useState(true);
  const [showRoma, setShowRoma] = useState(true);
  const [loading, setLoading] = useState(false);
  const isEnJp = dir === "en-jp";
  const from = isEnJp ? "English" : "Japanese";
  const to   = isEnJp ? "Japanese" : "English";
  const minH = isMobile ? 160 : 220;
  const maxH = isMobile ? 360 : 480;
  const [inputRef, inputHeight] = useAutoGrowTextarea(input, minH, maxH);

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true); setOut(""); setHira(""); setRoma(""); setNotes([]);
    try {
      if (isEnJp) {
        const prompt = tonePrompt(tone, dir) + ` Return ONLY this JSON, no markdown: {"translation":"<Japanese translation>","hiragana":"<full hiragana reading>","romaji":"<romanised reading>","notes":[{"category":"<one of: omitted, restructured, cultural, implicit>","original":"<the English phrase or pattern>","explanation":"<one-sentence explanation in English>"}]}
Use the notes array to flag English phrases or patterns that don't translate naturally to Japanese — e.g. greetings with no Japanese equivalent ("I hope this finds you well"), polite filler that's redundant in Japanese context ("just wanted to reach out", "thanks in advance" folded into a closer), restructured sentence patterns, or dropped pronouns (I, you, we). Categories: omitted (English phrase dropped because there's no equivalent), restructured (same meaning expressed differently), cultural (replaced with a Japanese-specific formula), implicit (meaning carried by context). Only include notes when there's something genuinely worth pointing out — return an empty array for straightforward 1:1 translations.`;
        const raw = await callAPI(prompt, input);
        try {
          const parsed = JSON.parse(raw.replace(/```json\n?|```\n?/g, "").trim());
          setOut(parsed.translation || raw);
          setHira(parsed.hiragana || "");
          setRoma(parsed.romaji || "");
          setNotes(Array.isArray(parsed.notes) ? parsed.notes.filter((n: TranslationNote) => n && n.original && n.explanation) : []);
        } catch { setOut(raw); }
      } else {
        setOut(await callAPI(tonePrompt(tone, dir) + " Return only the translation, no explanations.", input));
      }
    } catch { setOut("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const swap = () => { setDir(d => d === "en-jp" ? "jp-en" : "en-jp"); setInput(""); setOut(""); setHira(""); setRoma(""); setNotes([]); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{from}</span>
        <button onClick={swap} style={{ padding: "5px 12px", fontSize: 13 }}>⇄ Swap</button>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{to}</span>
      </div>
      <ToneSelector tone={tone} setTone={setTone} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{from}</p>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder={`Enter ${from} text…`} style={{ minHeight: minH, maxHeight: maxH, resize: "none", overflow: "auto" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{to}</p>
            {output && <CopyBtn text={output} />}
          </div>
          <div style={{ minHeight: inputHeight, maxHeight: maxH, border: "0.5px solid var(--border)", borderRadius: 8, overflow: "auto", background: "var(--bg-secondary)", ...(loading ? { display: "flex", alignItems: "center", justifyContent: "center" } : { padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }) }}>
            {loading ? <BaymaxLoader /> : !output ? (
              <span style={{ fontSize: 14, color: "var(--text-faint)" }}>Translation will appear here…</span>
            ) : (<>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{output}</p>
              {isEnJp && showHira && hiragana && <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text-muted)" }}>{hiragana}</p>}
              {isEnJp && showRoma && romaji   && <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text-faint)", fontStyle: "italic" }}>{romaji}</p>}
              {isEnJp && (hiragana || romaji) && (
                <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                  {hiragana && <button onClick={() => setShowHira(h => !h)} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, fontWeight: showHira ? 500 : 400, background: showHira ? "var(--bg-hover)" : "transparent", color: showHira ? "var(--text-primary)" : "var(--text-muted)" }}>Hiragana</button>}
                  {romaji   && <button onClick={() => setShowRoma(r => !r)} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, fontWeight: showRoma ? 500 : 400, background: showRoma ? "var(--bg-hover)" : "transparent", color: showRoma ? "var(--text-primary)" : "var(--text-muted)" }}>Romaji</button>}
                </div>
              )}
            </>)}
          </div>
        </div>
      </div>
      <button onClick={translate} disabled={loading || !input.trim()} style={{ alignSelf: "flex-start", padding: "8px 20px", fontSize: 14, fontWeight: 500 }}>
        {loading ? "Translating…" : "Translate"}
      </button>
      {notes.length > 0 && !loading && (
        <div style={{ borderLeft: "2px solid var(--accent-blue)", paddingLeft: 14 }}>
          <p style={{ fontSize: 12, color: "var(--accent-blue-text)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Translation notes</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {notes.map((n, i) => (
              <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.65, color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--bullet-color)", flexShrink: 0, marginTop: 1 }}>•</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 20, background: "var(--bg-hover)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", border: "0.5px solid var(--border-light)" }}>{n.category}</span>
                    <em style={{ color: "var(--text-primary)", fontStyle: "italic" }}>&ldquo;{n.original}&rdquo;</em>
                  </div>
                  <span>{n.explanation}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {output && !loading && <SuggestedPhrases tone={tone} />}
    </div>
  );
}

// ── Polisher Tab ──────────────────────────────────────────────────

function PolisherTab() {
  const isMobile = useIsMobile();
  const [tone, setTone]     = useState<ToneId>("internal");
  const [input, setInput]   = useState("");
  const [polished, setPol]  = useState("");
  const [changes, setChg]   = useState("");
  const [loading, setLoading] = useState(false);
  const minH = isMobile ? 160 : 200;
  const maxH = isMobile ? 360 : 480;
  const [inputRef] = useAutoGrowTextarea(input, minH, maxH);

  const polish = async () => {
    if (!input.trim()) return;
    setLoading(true); setPol(""); setChg("");
    try {
      const raw = await callAPI(polishSystemPrompt(tone), input);
      const p = JSON.parse(raw.replace(/```json\n?|```\n?/g, "").trim());
      setPol(p.polished || "");
      setChg(Array.isArray(p.changes) ? p.changes.join("\n") : String(p.changes || ""));
    } catch { setPol("Something went wrong. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <ToneSelector tone={tone} setTone={setTone} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Original Japanese</p>
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="日本語の文章をここに貼り付けてください…" style={{ minHeight: minH, maxHeight: maxH, resize: "none", overflow: "auto", fontSize: 15, lineHeight: 1.7 }} />
      </div>
      <button onClick={polish} disabled={loading || !input.trim()} style={{ alignSelf: "flex-start", padding: "8px 20px", fontSize: 14, fontWeight: 500 }}>
        {loading ? "Polishing…" : "Polish paragraph"}
      </button>
      {(loading || polished) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Polished Japanese</p>
              {polished && <CopyBtn text={polished} />}
            </div>
            <div style={{ border: "0.5px solid var(--border)", borderRadius: 8, padding: "12px 16px", fontSize: 15, lineHeight: 1.7, background: "var(--bg-secondary)", whiteSpace: loading ? undefined : "pre-wrap", minHeight: 80, color: polished ? "var(--text-primary)" : "var(--text-faint)", display: loading && !polished ? "flex" : undefined, alignItems: loading && !polished ? "center" : undefined, justifyContent: loading && !polished ? "center" : undefined }}>
              {loading && !polished ? <BaymaxLoader /> : polished}
            </div>
          </div>
          {changes && (
            <div style={{ borderLeft: "2px solid var(--accent-blue)", paddingLeft: 14 }}>
              <p style={{ fontSize: 12, color: "var(--accent-blue-text)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Changes made</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {changes.split("\n").filter(l => l.trim()).map((line, i) => (
                  <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.65, color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--bullet-color)", flexShrink: 0, marginTop: 1 }}>•</span>
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
  const [tab, setTab]           = useState("translate");
  const [userName, setUserName] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [favourites, setFavourites]   = useState<Set<string>>(new Set());
  const [customPhrases, setCustom]    = useState<CustomPhrase[]>([]);

  const loadUserData = async (name: string) => {
    setDataLoading(true);
    try {
      const [phrasesRes, favsRes] = await Promise.all([
        sheetsGet("phrases", name),
        sheetsGet("favourites", name),
      ]);
      setCustom(phrasesRes.phrases || []);
      setFavourites(new Set(favsRes.favourites || []));
    } catch {}
    setDataLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem("baymax-user");
    if (saved) { setUserName(saved); loadUserData(saved); }
    else setDataLoading(false);
  }, []);

  const handleUserSelect = (name: string) => { setUserName(name); loadUserData(name); };

  const switchUser = () => {
    localStorage.removeItem("baymax-user");
    setUserName(null); setCustom([]); setFavourites(new Set());
  };

  const toggleFav = async (jp: string) => {
    if (!userName) return;
    const isFav = favourites.has(jp);
    setFavourites(prev => { const next = new Set(prev); isFav ? next.delete(jp) : next.add(jp); return next; });
    if (isFav) await sheetsDelete("delete-favourite", { user_name: userName, jp });
    else await sheetsPost("add-favourite", { user_name: userName, jp });
  };

  const addPhrase = async (p: CustomPhrase) => {
    if (!userName) return;
    setCustom(prev => [...prev, p]);
    await sheetsPost("add-phrase", { user_name: userName, jp: p.jp, reading: p.reading, en: p.en, tone: p.tone, category: p.category, id: p.id });
  };

  const deletePhrase = async (id: string) => {
    if (!userName) return;
    setCustom(prev => prev.filter(p => p.id !== id));
    await sheetsDelete("delete-phrase", { user_name: userName, id });
  };

  if (dataLoading) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-faint)", fontSize: 14 }}>Loading…</div>;
  if (!userName)   return <UserPicker onSelect={handleUserSelect} />;

  const tabs = [["translate", "Translator"], ["polish", "Paragraph polisher"], ["glossary", "Glossary"]];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
          {userName} ·{" "}
          <button onClick={switchUser} style={{ border: "none", background: "transparent", color: "var(--text-faint)", fontSize: 12, textDecoration: "underline", cursor: "pointer", padding: 0 }}>
            Switch
          </button>
        </span>
      </div>
      <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", marginBottom: "1.5rem", overflowX: isMobile ? "auto" : undefined }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 18px", fontSize: 14, fontWeight: tab === id ? 500 : 400, background: "transparent", border: "none", borderBottom: tab === id ? `2px solid var(--text-primary)` : "2px solid transparent", borderRadius: 0, color: tab === id ? "var(--text-primary)" : "var(--text-muted)", marginBottom: -1, whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>
      {tab === "translate" ? <TranslatorTab /> :
       tab === "polish"    ? <PolisherTab />    :
       <GlossaryTab favourites={favourites} customPhrases={customPhrases} toggleFav={toggleFav} addPhrase={addPhrase} deletePhrase={deletePhrase} />}
    </div>
  );
}