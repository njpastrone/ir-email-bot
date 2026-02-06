import { useState } from 'react';

export default function EmailForm({ settings, onGenerate, isLoading }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    senderName: '',
    firmName: '',
    additionalContext: '',
    tone: 'conversational',
    contactRole: 'iro',
    length: 'standard',
    relationship: 'cold',
    structure: 'news-first'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      ...formData,
      preferredSources: settings.preferredSources
    });
  };

  const isValid = formData.companyName && formData.contactName && formData.senderName;

  return (
    <div className="email-form">
      <h3>Generate Email</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group compact">
          <label htmlFor="companyName">Company Name or Ticker</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g., Apple or AAPL"
            disabled={isLoading}
          />
        </div>

        <div className="form-group compact">
          <label htmlFor="contactName">Contact Name</label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="e.g., John Smith"
            disabled={isLoading}
          />
        </div>

        <div className="form-row">
          <div className="form-group compact">
            <label htmlFor="senderName">Your First Name</label>
            <input
              type="text"
              id="senderName"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              placeholder="e.g., Sarah"
              disabled={isLoading}
            />
          </div>

          <div className="form-group compact">
            <label htmlFor="firmName">Firm Name (optional)</label>
            <input
              type="text"
              id="firmName"
              name="firmName"
              value={formData.firmName}
              onChange={handleChange}
              placeholder="e.g., Acme IR"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group compact">
            <label htmlFor="contactRole">Role</label>
            <select
              id="contactRole"
              name="contactRole"
              value={formData.contactRole}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="iro">IRO</option>
              <option value="ceo">CEO</option>
              <option value="cfo">CFO</option>
            </select>
          </div>

          <div className="form-group compact">
            <label htmlFor="tone">Tone</label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="conversational">Conversational</option>
              <option value="formal">Formal</option>
              <option value="direct">Direct</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group compact">
            <label htmlFor="length">Length</label>
            <select
              id="length"
              name="length"
              value={formData.length}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="standard">Standard</option>
              <option value="brief">Brief</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>

          <div className="form-group compact">
            <label htmlFor="relationship">Relationship</label>
            <select
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="cold">Cold Outreach</option>
              <option value="warm">Existing Relationship</option>
            </select>
          </div>

          <div className="form-group compact">
            <label htmlFor="structure">Structure</label>
            <select
              id="structure"
              name="structure"
              value={formData.structure}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="news-first">News-First</option>
              <option value="intro-first">Intro-First</option>
            </select>
          </div>
        </div>

        <div className="form-group compact">
          <label htmlFor="additionalContext">Additional Context (optional)</label>
          <textarea
            id="additionalContext"
            name="additionalContext"
            value={formData.additionalContext}
            onChange={handleChange}
            placeholder="e.g., 'Focus on the recent CEO transition' or 'Reference the supply chain issues'"
            disabled={isLoading}
            rows={3}
          />
          <span className="form-helper">Guide which news angle the email references</span>
        </div>

        <button
          type="submit"
          className="primary generate-btn"
          disabled={!isValid || isLoading}
        >
          {isLoading && <span className="spinner-inline" />}
          {isLoading ? 'Generating...' : 'Generate Email'}
        </button>
      </form>
    </div>
  );
}
