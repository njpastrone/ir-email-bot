import { useState, useEffect } from 'react';
import Settings from './components/Settings';
import EmailForm from './components/EmailForm';
import EmailDisplay from './components/EmailDisplay';

const DEFAULT_SETTINGS = {
  firmName: 'Rivel Research Group',
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

  useEffect(() => {
    localStorage.setItem('ir-email-bot-settings', JSON.stringify(settings));
  }, [settings]);

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError('');
    setEmail('');
    setMeta(null);

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
      setMeta({
        articlesFound: data.articlesFound,
        sources: data.sources
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>IR Email Bot</h1>
        <p>Generate personalized outreach emails for investor relations prospects</p>
      </header>

      <main className="main-content">
        <Settings settings={settings} onSettingsChange={setSettings} />
        <EmailForm
          settings={settings}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        {isLoading && (
          <div className="card">
            <div className="loading">
              <div className="spinner" />
              <span>Fetching news and generating email...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="card">
            <div className="error">{error}</div>
          </div>
        )}

        <EmailDisplay email={email} meta={meta} />
      </main>
    </div>
  );
}

export default App;
