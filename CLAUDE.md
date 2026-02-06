# Signal

## Project Overview

Signal is a news-driven email drafting tool for IR (Investor Relations) consultants to prospect IROs (Investor Relations Officers) and senior executives at publicly traded companies. The tool fetches recent news about a target company, generates an AI-powered summary of key themes, and drafts personalized outreach emails (cold or warm) that reference specific coverage.

## Target Users

**Primary User**: IR consultants who need to prospect potential clients

**Email Recipients**:
- IROs (Investor Relations Officers)
- CEOs and CFOs of publicly traded companies
- Other senior executives responsible for investor communication

## Core Functionality

### User Flow
1. User enters a **company name** (publicly traded)
2. User enters a **contact name** (the recipient)
3. User enters their **first name** (for the sign-off)
4. System fetches recent news and generates:
   - AI summary of key investor themes ("What's Happening")
   - Identification of the cited article referenced in the email
   - Draft outreach email with separate subject and body
5. User reviews/edits, optionally refines with natural language instructions, and copies to their email client

### Output Display
The result screen shows:
1. **News Context Section**:
   - "What's Happening at [Company]" header
   - AI-generated summary of key investor themes (1-2 sentences)
   - Featured cited article (the one referenced in the email)
   - Collapsible "View Other Sources" dropdown for additional articles
2. **Email Section**:
   - Separate subject line input field
   - Email body textarea (editable)
   - Copy button (copies body only)
   - Feedback buttons (thumbs up/down)
   - Refinement input bar for iterative tweaks (e.g., "make it shorter", "more formal tone")

### Technical Architecture
- **Frontend**: React + Vite
- **Backend**: Express.js
- **AI**: Claude API (Sonnet) for email generation and news summarization
- **News**: Google News RSS for fetching recent company coverage

---

## Email Generation

### Prompt Structure (v2)
The email prompt uses a structured format with XML tags:

```
<role>Senior IR consultant persona</role>
<context>Why personalized emails work better</context>
<task>Write email to [contact] at [company]</task>
<company_research>[News articles]</company_research>
<relationship_context>[Cold vs. warm outreach guidance]</relationship_context>
<recipient_context>[Role-specific guidance]</recipient_context>
<email_structure>Dynamic: news-first (Pain → Insight → CTA) or intro-first (Introduction → Value → CTA)</email_structure>
<tone_guidance>Humble, conversational approach</tone_guidance>
<style>Writing style instructions</style>
<examples>Few-shot examples</examples>
<output_format>JSON with email and citedArticleIndex</output_format>
```

### Email Structures

The `<email_structure>` and `<examples>` sections are dynamic, swapped based on the selected structure setting. There are two structures:

#### News-First (default): Pain → Insight → CTA

**Paragraph 1 - THE PAIN (1-2 sentences)**
- Reference the news source and general topic
- Acknowledge the type of challenge they're facing
- Stay humble and empathetic, not presumptuous

**Paragraph 2 - THE INSIGHT (2-3 sentences)**
- Describe the universal challenge companies in their situation face (preferred Henkel-style: "about them")
- Focus on the perception gap between what management intends to communicate and what investors hear
- Acceptable alternative: reference having helped others, but keep center of gravity on recipient's challenge

**Paragraph 3 - THE CALL TO ACTION (1-2 sentences)**
- Propose a specific next step with timeframe
- Always include "this week or next" or similar
- Can add reciprocity (e.g., "happy to share what we typically see and hear your perspective")

#### Intro-First (more direct): Introduction → Value → CTA

**Paragraph 1 - THE INTRODUCTION (1-2 sentences)**
- Open with name and team at firm (e.g., "I'm part of the IR advisory team here at [firm]")
- Team name is configurable via a "Team Name" input field (defaults to "IR advisory team")

**Paragraph 2 - THE VALUE (2-3 sentences)**
- Connect team's work to challenges relevant to the recipient's role and industry
- Describe outcomes (e.g., "getting clarity on investor sentiment") rather than services

**Paragraph 3 - THE CALL TO ACTION (1-2 sentences)**
- Ask for calendar time with a specific timeframe
- Keep logistically simple (e.g., "let me know when works best and I'll send an invite")

### Example Output (News-First)
```
Subject: Quick thought about the Crestline acquisition

Hi Leslie,

I saw that Journal piece on the Crestline acquisition. That's a big strategic bet that probably has investors asking a lot of questions about integration and synergies.

Many management teams in the middle of an M&A story find that what they intend to communicate and what investors actually hear aren't always the same. When you can clearly see where that gap exists, it becomes much easier to address the questions, concerns, and priorities that are really driving investor behavior.

Happy to share what we typically see and hear your perspective. Do you have 15 minutes later this week or next to discuss?

Best,
Sarah
```

### Example Output (Intro-First)
```
Subject: Introduction from Crestwood's IR advisory team

Hi Maria,

My name is Sarah, and I'm part of the IR advisory team here at Crestwood Partners.

We work with IR teams in the healthcare space to understand what investors are actually focused on and where the messaging might be landing differently than intended. My team specifically focuses on priorities related to perception gaps, analyst sentiment, and positioning around key catalysts.

Do you have availability for an introduction this week? Let me know when works best and I'll send an invite.

Thanks in advance,
Sarah
```

### Output Format
The Claude API returns JSON:
```json
{
  "email": "Subject: ...\n\nHi James,\n\n...",
  "citedArticleIndex": 1
}
```

The `citedArticleIndex` identifies which article (1-based) was referenced in paragraph 1, enabling the UI to highlight the cited source.

---

## News Summary Generation

A separate Claude call generates a brief summary of key investor themes:

**Input**: Company name + news context
**Output**: 1-2 sentence summary (under 40 words)

Example: "Recent coverage focuses on margin pressures amid rising input costs and questions about the international expansion timeline."

---

## Configuration Options

### User Settings (configurable in sidebar)
- **Firm name**: Required - consultant's firm name (included in email persona and intro-first structure)
- **Preferred news sources**: Customizable list of sources to prioritize

### Default News Sources
- Wall Street Journal
- Bloomberg
- Reuters
- Financial Times
- CNBC
- Barron's
- Investor's Business Daily
- Yahoo Finance
- Seeking Alpha

### Tone Options
- `conversational` (default): Casual, as if sent between meetings
- `formal`: Professional, polished language
- `direct`: Concise, every sentence earns its place

### Contact Role Options
- `iro` (default): Investor Relations Officer
- `ceo`: Chief Executive Officer
- `cfo`: Chief Financial Officer

### Length Options
- `brief`: 60-80 words
- `standard` (default): 80-120 words
- `detailed`: 120-150 words

### Relationship Options
- `cold` (default): First-time outreach — leads directly with the news reference, no prior relationship assumed
- `warm`: Existing relationship — opens with a brief warm note (e.g., "Hope you've been well"), then transitions to the news reference; CTA is framed as reconnecting

### Structure Options
- `news-first` (default): Opens with a news reference (Pain → Insight → CTA). Signs off with "Best,". Uses 3 few-shot examples with the Henkel-style insight-driven P2 as the preferred style.
- `intro-first` (labeled "more direct"): Opens with a self-introduction and team positioning (Introduction → Value → CTA). Signs off with "Thanks in advance,". Uses 2 few-shot examples. Structure is independent from Relationship, giving 4 possible combinations.

### Team Name
- Defaults to "IR advisory team"
- Configurable input field that appears when intro-first structure is selected
- Used in the opening: "I'm part of the [team name] here at [firm]"

### Source Preference
When choosing which article to cite, the prompt favors coverage from the Wall Street Journal, Bloomberg, or Financial Times. Other sources are used only when these three have no relevant coverage.

---

## Context: Why This Matters to IROs

Key pain points that make IROs receptive to outreach:

1. **Investor Perception Gaps**: IROs struggle to understand what investors actually think vs. what management believes they think
2. **Valuation Disconnect**: When stock price doesn't reflect perceived company value, IROs face pressure from leadership
3. **Resource Constraints**: Small IR teams (often 1-2 people) can't conduct comprehensive perception research themselves
4. **Executive Alignment**: IROs need external validation to influence C-suite messaging
5. **Activist Risk**: Proactive perception management helps identify vulnerabilities before activists exploit them

## Value Proposition

The emails reflect core IR consulting value (conversationally, not as marketing):
- Investor perception research
- Expectation management
- Understanding gaps between management intent and market interpretation
- Helping leadership teams proactively address perception issues

---

## Email Refinement

After generating an email, users can iteratively refine it using natural language instructions via a refinement input bar below the email textarea. This uses Claude's multi-turn messages API to preserve the full conversation context (original prompt with news, tone, examples, etc.) across refinement rounds.

**How it works:**
- The generate-email response includes a `messages` array (the original prompt + assistant response)
- Each refinement appends a user instruction and gets back a revised email
- Manual edits to the email textarea are synced into the conversation before refining
- The cited article and news context stay fixed; only the email text updates
- Unlimited refinement rounds — conversation history grows minimally (short emails)

**Key endpoint:** `POST /api/refine-email` accepts `{ messages, instruction }` and returns `{ email, messages }`.

---

## Technical Constraints

- No authentication required
- No persistence (generate and forget)
- Low volume expected (API cost not a concern)
