# IR Email Bot

## Project Overview

A simple email drafting tool for IR (Investor Relations) consultants to prospect IROs (Investor Relations Officers) and senior executives at publicly traded companies. The tool generates personalized cold outreach emails based on recent company news and market developments.

## Target Users

**Primary User**: IR consultants at firms like Rivel Research Group who need to prospect potential clients

**Email Recipients**:
- IROs (Investor Relations Officers)
- CEOs and CFOs of publicly traded companies
- Other senior executives responsible for investor communication

## Core Functionality

### User Flow
1. User enters a **company name** (publicly traded)
2. User enters a **contact name** (the recipient)
3. System generates a draft cold outreach email using Claude API
4. User reviews/edits and sends via their own email client

### Technical Architecture
- Simple frontend (minimal UI)
- Claude API connection for email generation
- Web search capability to find recent news about the target company

## Email Generation Prompt

```
You are an investor relations consultant writing a cold outbound email to the CEO or senior executive of a publicly traded company.

First, identify the company's most recent market-facing challenges by referencing credible, current financial journalism (for example, recent Wall Street Journal coverage). Distill these challenges into two to three concise, valuation-relevant themes that investors appear focused on. Do not quote articles directly, but reflect their substance accurately.

Then, write a short, casual, human-sounding email that follows this structure:

- Open by noting that you have recently read a few articles about the company and briefly summarize the market perception or investor concern implied by those articles.
- Position your firm as specializing in investor perception research and expectation management, including understanding what investors truly believe, identifying gaps between management intent and market interpretation, and helping leadership teams proactively address those gaps. Base this description on Rivel's positioning, without sounding like marketing copy.
- End with a single, low-pressure question asking whether a short conversation would be useful.

Style constraints:

- Keep the email short and conversational, as if sent between meetings.
- Avoid buzzwords, jargon, and formulaic sales language.
- Do not use em dashes.
- Do not use emojis.
- Avoid rigid lists or obvious rhetorical structures.
- Make it sound like it was written by a real person, not an AI.
- Include a subtle but intriguing subject line that does not reveal the pitch.

Output only the final email, including the subject line and signature, with no explanation of your process.
```

## Context: Why This Matters to IROs

Based on background research (see `docs/investor-relations-background.md`), key pain points that make IROs receptive to outreach:

1. **Investor Perception Gaps**: IROs struggle to understand what investors actually think vs. what management believes they think
2. **Valuation Disconnect**: When stock price doesn't reflect perceived company value, IROs face pressure from leadership
3. **Resource Constraints**: Small IR teams (often 1-2 people) can't conduct comprehensive perception research themselves
4. **Executive Alignment**: IROs need external validation to influence C-suite messaging
5. **Activist Risk**: Proactive perception management helps identify vulnerabilities before activists exploit them

## Rivel Research Group Positioning

The emails should reflect Rivel's core value proposition (without sounding like marketing):
- Investor perception research
- Expectation management
- Understanding gaps between management intent and market interpretation
- Helping leadership teams proactively address perception issues

---

## Confirmed Requirements

### User Inputs (per email)
- **Company**: Name or ticker symbol (either works, public companies only)
- **Contact name**: Recipient's name
- **Sender first name**: For the email sign-off

### User Settings (configurable)
- **Firm name**: The consultant's firm (e.g., "Rivel Research Group")
- **Preferred news sources**: User can configure which sources to prioritize

### Preferred News Sources (defaults)
Top-tier financial journalism sources to reference:
- Wall Street Journal
- Bloomberg
- Reuters
- Financial Times
- CNBC
- Barron's
- Investor's Business Daily
- Yahoo Finance
- Seeking Alpha

Users should be able to customize this list.

### Output
- Single email draft (subject line + body + signature)
- Generate and forget (no persistence needed for v1)

### Technical Constraints
- No authentication required for v1
- No hosting constraints
- Low volume expected (API cost not a concern)
