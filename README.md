# Signal

A news-driven email drafting tool for IR consultants to prospect IROs and senior executives at publicly traded companies. Signal fetches recent news, summarizes key investor themes, and generates personalized outreach emails.

**Live:** [ir-email-bot.onrender.com](https://ir-email-bot.onrender.com)

## Features

- **News-Driven Outreach**: Automatically fetches recent news about target companies
- **AI News Summary**: Generates a concise "What's Happening" summary of key investor themes
- **Smart Email Generation**: Creates personalized emails using the Pain → Medicine → CTA structure
- **Cited Source Tracking**: Identifies and highlights the article referenced in the email
- **Separate Subject/Body**: Edit subject line and email body independently
- **Iterative Refinement**: Refine generated emails with natural language instructions (e.g., "make it shorter", "more formal tone")
- **Customizable Settings**: Configure firm name and preferred news sources

## Setup

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Create the server environment file:
   ```bash
   cp server/.env.example server/.env
   ```

3. Add your Anthropic API key to `server/.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-api-key-here
   ```

## Running the App

Start both the frontend and backend:

```bash
npm run dev
```

This runs:
- Frontend at http://localhost:5173
- Backend at http://localhost:3001

## Usage

1. Open http://localhost:5173
2. Enter a company name or ticker symbol
3. Enter the contact's name
4. Enter your first name for the sign-off
5. Click "Generate Email"
6. Review the output:
   - **News Summary**: AI-generated summary of key themes
   - **Cited Article**: The specific article referenced in your email
   - **Other Sources**: Expandable list of additional articles found
   - **Subject Line**: Editable subject field
   - **Email Body**: Editable email text
   - **Refine Bar**: Type instructions like "make it shorter" or "reference the margin story instead" to iteratively tweak the email
7. Copy the email body to your clipboard

### Settings (Optional)

Click the Settings section in the sidebar to configure:
- **Firm Name**: Your firm's name (included in email if provided)
- **Preferred Sources**: Add/remove news sources to prioritize

## Project Structure

```
signal/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── EmailForm.jsx      # Input form
│       │   ├── EmailDisplay.jsx   # Results display
│       │   ├── Settings.jsx       # User settings
│       │   └── HowItWorks.jsx     # Info modal
│       ├── App.jsx
│       └── index.css
├── server/                 # Express backend
│   ├── routes/
│   │   └── email.js              # API endpoints
│   └── services/
│       ├── claude.js             # Claude API (email + summary generation)
│       └── news.js               # Google News RSS fetching
├── docs/
│   └── investor-relations-background.md
└── package.json
```

## API Endpoints

### POST /api/generate-email

Generate an email with news summary.

**Request Body:**
```json
{
  "companyName": "Apple",
  "contactName": "John Smith",
  "senderName": "Sarah",
  "firmName": "Acme Consulting",
  "preferredSources": ["Wall Street Journal", "Bloomberg"],
  "tone": "conversational",
  "contactRole": "cfo",
  "length": "standard"
}
```

**Response:**
```json
{
  "email": "Subject: Quick question...\n\nHi John,...",
  "newsSummary": "Recent coverage focuses on...",
  "citedArticle": {
    "title": "Apple Faces Margin Pressure...",
    "source": "Wall Street Journal",
    "url": "https://...",
    "publishedAt": "2024-01-15"
  },
  "articles": [...],
  "articlesFound": 5
}
```

### POST /api/refine-email

Refine an existing email with a natural language instruction.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "instruction": "make it shorter"
}
```

**Response:**
```json
{
  "email": "Subject: ...\n\nHi John,...",
  "messages": [...]
}
```

### GET /api/prompt-info

Returns information about the current prompt configuration.

## License

MIT
