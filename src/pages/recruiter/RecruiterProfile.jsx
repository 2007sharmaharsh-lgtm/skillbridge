import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRecruiterProfile, updateRecruiterProfile } from '../../services/firestoreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUploader from '../../components/ImageUploader';
import { Building, Globe, MapPin, Save, Check, FileText, Image } from 'lucide-react';

export default function RecruiterProfile() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Enterprise Software & Cloud',
    description: '',
    website: '',
    location: '',
    logoURL: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const data = await getRecruiterProfile(currentUser.uid);
        if (data) {
          setFormData({
            companyName: data.companyName || '',
            industry: data.industry || 'Enterprise Software & Cloud',
            description: data.description || '',
            website: data.website || '',
            location: data.location || '',
            logoURL: data.logoURL || '',
          });
        }
      } catch (err) {
        console.error('Error loading recruiter profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateRecruiterProfile(currentUser.uid, formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving recruiter profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading company profile..." />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Company Profile & Hiring Identity</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Information configured here is presented to students browsing your open internships and placement vacancies.
        </p>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', borderRadius: 'var(--border-radius)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> Company profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="grid-2" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Company / Organization Name</label>
            <input
              type="text"
              name="companyName"
              className="form-input"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Acme Tech Solutions"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Industry Sector</label>
            <input
              type="text"
              name="industry"
              className="form-input"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g. Information Technology / Fintech / AI"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Headquarters / Office Location</label>
            <input
              type="text"
              name="location"
              className="form-input"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, India"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Website URL</label>
            <input
              type="url"
              name="website"
              className="form-input"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://acme.io"
            />
          </div>
        </div>

        <ImageUploader
          currentImage={formData.logoURL}
          onImageChange={(newLogo) => setFormData(prev => ({ ...prev, logoURL: newLogo }))}
          label="Company Logo / Brand Badge"
          shape="rounded"
          size={80}
        />

        <div className="form-group">
          <label className="form-label">About the Company & Work Culture</label>
          <textarea
            name="description"
            rows={4}
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your organization's mission, technology stack, internship learning opportunities, and work culture..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Company Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
