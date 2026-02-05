import { useState } from 'react';

const DEFAULT_SOURCES = [
  'Wall Street Journal',
  'Bloomberg',
  'Reuters',
  'Financial Times',
  'CNBC',
  "Barron's",
  "Investor's Business Daily",
  'Yahoo Finance',
  'Seeking Alpha'
];

export default function Settings({ settings, onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newSource, setNewSource] = useState('');

  const handleAddSource = () => {
    if (newSource.trim() && !settings.preferredSources.includes(newSource.trim())) {
      onSettingsChange({
        ...settings,
        preferredSources: [...settings.preferredSources, newSource.trim()]
      });
      setNewSource('');
    }
  };

  const handleRemoveSource = (source) => {
    onSettingsChange({
      ...settings,
      preferredSources: settings.preferredSources.filter(s => s !== source)
    });
  };

  const handleResetSources = () => {
    onSettingsChange({ ...settings, preferredSources: DEFAULT_SOURCES });
  };

  return (
    <div className="settings-section">
      <div className="settings-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>
          <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Settings
        </h3>
        <svg className={`chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && (
        <div className="settings-content">
          <div className="form-group compact">
            <label>Preferred News Sources</label>
            <div className="sources-list">
              {settings.preferredSources.map(source => (
                <span key={source} className="source-tag">
                  {source}
                  <button type="button" onClick={() => handleRemoveSource(source)}>x</button>
                </span>
              ))}
            </div>
            <div className="add-source">
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Add source"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSource())}
              />
              <button type="button" className="secondary" onClick={handleAddSource}>Add</button>
            </div>
            <button type="button" className="reset-link" onClick={handleResetSources}>
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
