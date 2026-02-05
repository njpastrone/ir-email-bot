# Signal

## Project Overview

Signal is a news-driven email drafting tool for IR (Investor Relations) consultants to prospect IROs (Investor Relations Officers) and senior executives at publicly traded companies. The tool fetches recent news about a target company, generates an AI-powered summary of key themes, and drafts personalized cold outreach emails that reference specific coverage.

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
   - Draft cold outreach email with separate subject and body
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
<recipient_context>[Role-specific guidance]</recipient_context>
<email_structure>Pain → Medicine → CTA format</email_structure>
<tone_guidance>Humble, conversational approach</tone_guidance>
<style>Writing style instructions</style>
<examples>Few-shot examples</examples>
<output_format>JSON with email and citedArticleIndex</output_format>
```

### Email Structure: Pain → Medicine → CTA

**Paragraph 1 - THE PAIN (1-2 sentences)**
- Reference the news source and general topic
- Acknowledge the type of challenge they're facing
- Stay humble and empathetic, not presumptuous

**Paragraph 2 - THE MEDICINE (2-3 sentences)**
- Show you've helped others in similar situations
- Keep the description conversational and general
- Connect to the type of problem, not specific details

**Paragraph 3 - THE CALL TO ACTION (1-2 sentences)**
- Propose a specific next step with timeframe
- Always include "this week or next" or similar
- Keep the ask simple and direct

### Example Output
```
Subject: Quick question about analyst sentiment

Hi James,

I saw that Journal piece on Meridian's margin outlook. That's always a tricky narrative to manage.

We've helped other healthcare CFOs in similar spots get clarity on what investors are actually focused on versus what's landing. Often there's a gap worth addressing.

Do you have 15 minutes later this week or next to discuss?

Best,
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
- **Firm name**: Optional - consultant's firm name (included in email persona if provided)
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
