import { useState, useEffect } from 'react';
import Settings from './components/Settings';
import EmailForm from './components/EmailForm';
import EmailDisplay from './components/EmailDisplay';
import HowItWorks from './components/HowItWorks';

const DEFAULT_SETTINGS = {
  preferredSources: [
    'Wall Street Journal',
    'Bloomberg',
    'Reuters',
    'Financial Times',
    'CNBC',
    "Barron's",
    "Investor's Business Daily",
    'Yahoo Finance',
    'Seeking Alpha'
  ]
};

function App() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ir-email-bot-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [email, setEmail] = useState('');
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationMessages, setConversationMessages] = useState(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState('');

  useEffect(() => {
    localStorage.setItem('ir-email-bot-settings', JSON.stringify(settings));
  }, [settings]);

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError('');
    setEmail('');
    setMeta(null);
    setConversationMessages(null);
    setRefineError('');

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setEmail(data.email);
      setConversationMessages(data.messages);
      setMeta({
        articlesFound: data.articlesFound,
        sources: data.sources,
        articles: data.articles,
        citedArticle: data.citedArticle,
        companyName: formData.companyName,
        newsSummary: data.newsSummary
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (instruction, currentEmailText) => {
    setIsRefining(true);
    setRefineError('');

    try {
      // If user manually edited the email, update the last assistant message
      const messages = [...conversationMessages];
      if (currentEmailText !== messages[messages.length - 1].content) {
        messages[messages.length - 1] = { role: 'assistant', content: currentEmailText };
      }

      const response = await fetch('/api/refine-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, instruction })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine email');
      }

      setEmail(data.email);
      setConversationMessages(data.messages);
    } catch (err) {
      setRefineError(err.message);
    } finally {
      setIsRefining(false);
    }
  };

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="state-container">
          <div className="loading-state">
            <div className="spinner-large" />
            <p>Fetching news and generating email...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-container">
          <div className="error-state">
            <div className="error-icon">!</div>
            <p>{error}</p>
            <button className="secondary" onClick={() => setError('')}>
              Dismiss
            </button>
          </div>
        </div>
      );
    }

    if (email) {
      return (
        <EmailDisplay
          email={email}
          meta={meta}
          onRefine={handleRefine}
          isRefining={isRefining}
          refineError={refineError}
          canRefine={!!conversationMessages}
        />
      );
    }

    return (
      <div className="state-container">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2>Generate Your First Email</h2>
          <p>Enter a company name and contact details in the form to generate a personalized outreach email.</p>
          <HowItWorks variant="prominent" />
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Signal</h1>
          <p>News-driven IR outreach</p>
        </header>
        <div className="sidebar-content">
          <EmailForm
            settings={settings}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          <Settings settings={settings} onSettingsChange={setSettings} />
        </div>
        <div className="sidebar-footer">
          <HowItWorks variant="subtle" />
        </div>
      </aside>
      <main className="main-area">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
