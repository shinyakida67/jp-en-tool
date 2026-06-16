# Baymax — Project Notes

JP-EN business communication tool for non-native Japanese speakers working in a Japanese business environment.

---

## What it does

| Tab | Function |
|-----|----------|
| **Translator** | EN↔JP with tone-aware prompts (Internal / Internal Formal / Client) |
| **Paragraph Polisher** | Polishes rough Japanese + shows line-by-line explanation of changes |
| **Glossary** | Curated phrase library (8 categories) with favourites, custom phrases, and copy |

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Gemini 3.1 Flash Lite, Google Sheets (user backend)

---

## Known Issues

- Nothing logged yet.

---

## Ideas & Improvements

### Verified Phrase Bank
Pre-approved Japanese translations that Baymax uses directly instead of re-translating. Implementation via a new **Verified Phrases** tab in Google Sheets (columns: English input, verified Japanese output, tone, approval flag). Start with exact matches before fuzzy matching.
- **Open question:** who approves phrases?

### Honour system name picker
Currently no password protection — users self-identify by name only.
- **Future option:** proper authentication via Supabase if the team grows or abuse becomes an issue.

### Glossary navigation
Desktop uses a sidebar (Option A), mobile uses pills (Option B).
- **Note:** Option B (pills) is worth considering for desktop too.

### Paragraph polisher — language auto-detection
Add English polishing support with auto language detection so the polisher works on both JP and EN text.
- Add tab descriptors to clarify the difference between tools: *"convert between languages"* (Translator) vs *"refine what you've written"* (Polisher).

### ~~Hiragana / romaji readings for translations~~
✅ Done — EN→JP output shows hiragana and romaji with toggle pills (Variant 3).

### Glossary categories — expand beyond email
Current categories are email-centric. Worth adding scenarios for:
- Phone calls
- Lark messages
- In-person meetings
- Introductions
- Giving / receiving feedback
- Problem & escalation scenarios

### ~~Glossary search~~
✅ Done — input at top of glossary, searches Japanese / reading / English simultaneously, stacks with tone + category filters, clear `✕` button, "no matches" message when search yields nothing.

**Not yet implemented (revisit if missed):**
- Match highlighting — bold the matching substring in result cards
- Fuzzy matching — typo-tolerant search
- Keyboard shortcut — `Cmd/Ctrl + K` to focus search

### ~~Translation notes (EN→JP)~~
✅ Done — v1 (Option A) is live. Notes section appears below the output when there's something worth pointing out, with category pills (omitted / restructured / cultural / implicit) and one-line explanations. Returns empty array for straightforward translations so the section stays hidden.

**Still backburner — flipped Option D**
Toggle behaviour: shown by default, "Hide notes" link that persists in localStorage so power users can opt out.

---

**Original spec preserved below for reference**

English and Japanese business communication have different conventions — direct translation often produces awkward or unnatural results. Surface this to the user so they understand why the Japanese output doesn't 1:1 map to the input.

**Examples of phrases that don't translate naturally**
- *"I hope this email finds you well"* — no Japanese equivalent; the opener 「お世話になっております」 already serves this role
- *"I wanted to reach out about…"* — usually dropped; Japanese gets straight to the point
- *"Thanks in advance"* — folded into the closer 「よろしくお願いいたします」
- *"Sorry to bother you"* — restructured into 「お忙しいところ恐れ入りますが…」
- Dropped pronouns (I, you, we) — implicit in Japanese context

**Categories of notes**
- **Dropped** — English phrase omitted because it has no Japanese equivalent
- **Restructured** — same meaning, expressed completely differently
- **Cultural substitution** — replaced with a Japanese-specific formula
- **Implicit** — meaning carried by context (dropped pronouns, etc.)

**v1 plan — Option A: always-shown notes section**
A small "Translation notes" section appears below the Japanese output, only when there's something to say. Mirrors the Polisher's existing "Changes made" pattern for consistency. Each note is a one-liner with a category label, e.g.:
> • *(omitted)* "I hope this email finds you well" — the opener 「お世話になっております」 already conveys this in Japanese
> • *(folded)* "Thanks in advance" — handled by the closer 「よろしくお願いいたします」

**Implementation**
- Extend the EN→JP translate prompt to also return `notes: [{category, original, explanation}]` in the existing JSON
- Render notes underneath the translation in the output box (or just below it, like the Polisher's changes block)
- No notes returned → section hidden entirely

**Backburner enhancement — flipped Option D**
Once v1 is live, consider flipping toggle behaviour: notes shown by default, with a small "Hide notes" link that persists the preference in localStorage. So learners keep them visible, advanced users can opt out for a cleaner view.

### Context-aware tools
Let users paste an email thread or prior conversation as additional context. Baymax uses that context to inform its existing structured outputs — without becoming a general AI chatbot.

**Core principle**
> Context goes IN. Structured Baymax output comes OUT. The output schema never collapses into freeform.

This is what distinguishes context-aware features from "paste-thing-AI-does-thing." Translation/polishing still returns the same JSON shape; the AI just makes smarter choices because it sees the conversation.

**The three features**

1. **Context-aware Polisher** ✅ *Live*
   Paste an email thread → polishing matches the tone, terminology, and formality already established. The existing "Changes made" list now references context (e.g. *"Matched brief tone from prior message"*).

2. **Context-aware Translator** — *not yet built*
   Same pattern: paste a thread + new English/Japanese to translate. The existing translation notes can reference context (e.g. *"(matched) Kept casual since the thread has been informal"*).

3. **Consistency Checker** — *not yet built*
   New output section. When context is provided, Baymax flags terminology drift between the user's draft and the prior conversation. e.g. *"Client used テスト環境, you wrote 検証環境 — match?"* with inline action buttons.

**Handling the "client used the wrong term" case**
The checker doesn't enforce, it surfaces and explains:
- *Suggest matching* — both terms valid, match for consistency
- *Suggest correcting* — client used an incorrect term; user's term is more accurate
- *Ambiguous* — both common, no clear anchor → user decides

Anchor sources, in trust order: Verified Phrase Bank → Glossary → general LLM judgement → no anchor.

**UI pattern (already implemented in Polisher)**
- Expandable "Add context" section between tone selector and main input
- Collapsed by default → keeps standard flow uncluttered
- When filled, button shows "📎 Context active · N chars"
- Auto-grows with content using the existing `useAutoGrowTextarea` hook
- Context stays in state between polishes within the same tab session

**Chatbot tests — apply before shipping any context feature**
| Question | Chatbot answer | Baymax answer |
|---|---|---|
| Output shape? | Freeform text | Defined JSON / structured fields |
| User still writes the reply themselves? | No, AI does | Yes, AI assists |
| Multi-turn back-and-forth? | Yes | No, single turn |
| Value is in AI intelligence or Baymax's curation/structure? | AI intelligence | Curation/structure |

### Shared database upgrade
Replace Google Sheets with Supabase or Firebase if team-wide shared custom phrases are needed in future.

---

## Decisions & Notes

- Tone system (Internal / Internal Formal / Client) is the core differentiator — keep it central in any new features.
- Google Sheets is the DB; no separate auth service. User identified by name only.
- AI model: Gemini 3.1 Flash Lite via `/api/translate`.
