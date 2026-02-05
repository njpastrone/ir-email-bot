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

  const handleFirmNameChange = (e) => {
    onSettingsChange({ ...settings, firmName: e.target.value });
  };

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
    <div className="card">
      <button
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Hide Settings' : 'Show Settings'}
      </button>

      {isOpen && (
        <div className="settings-content">
          <div className="form-group">
            <label htmlFor="firmName">Your Firm Name</label>
            <input
              type="text"
              id="firmName"
              value={settings.firmName}
              onChange={handleFirmNameChange}
              placeholder="e.g., Rivel Research Group"
            />
          </div>

          <div className="form-group">
            <label>Preferred News Sources</label>
            <div className="sources-list">
              {settings.preferredSources.map(source => (
                <span key={source} className="source-tag">
                  {source}
                  <button onClick={() => handleRemoveSource(source)}>x</button>
                </span>
              ))}
            </div>
            <div className="add-source">
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Add a news source"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
              />
              <button className="secondary" onClick={handleAddSource}>Add</button>
            </div>
            <button
              className="settings-toggle"
              style={{ marginTop: '0.75rem' }}
              onClick={handleResetSources}
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
