# IR Email Bot

A simple email drafting tool for IR consultants to prospect IROs and senior executives at publicly traded companies.

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
2. (Optional) Click "Show Settings" to configure your firm name and preferred news sources
3. Enter a company name or ticker symbol
4. Enter the contact's name
5. Enter your first name for the sign-off
6. Click "Generate Email"
7. Review the generated email and copy to clipboard

## Project Structure

```
ir-email-bot/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── EmailForm.jsx
│       │   ├── EmailDisplay.jsx
│       │   └── Settings.jsx
│       ├── App.jsx
│       └── index.css
├── server/                 # Express backend
│   ├── routes/
│   │   └── email.js
│   └── services/
│       ├── claude.js       # Claude API wrapper
│       └── news.js         # Google News RSS fetching
└── package.json
```
