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

### Shared database upgrade
Replace Google Sheets with Supabase or Firebase if team-wide shared custom phrases are needed in future.

---

## Decisions & Notes

- Tone system (Internal / Internal Formal / Client) is the core differentiator — keep it central in any new features.
- Google Sheets is the DB; no separate auth service. User identified by name only.
- AI model: Gemini 3.1 Flash Lite via `/api/translate`.
