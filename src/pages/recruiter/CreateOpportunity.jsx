import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createOpportunity, getRecruiterProfile } from '../../services/firestoreService';
import { COMMON_SKILLS, OPPORTUNITY_TYPES } from '../../constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import SkillTag from '../../components/SkillTag';
import { PlusCircle, Plus, X, ArrowLeft, Briefcase } from 'lucide-react';

export default function CreateOpportunity() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: OPPORTUNITY_TYPES.INTERNSHIP,
    description: '',
    location: '',
    duration: '6 Months',
    compensation: '',
    deadline: '',
    openings: 2,
  });

  const [requiredSkills, setRequiredSkills] = useState(['Python', 'React']);
  const [preferredSkills, setPreferredSkills] = useState(['Docker']);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');

  useEffect(() => {
    async function loadRecruiter() {
      if (!currentUser) return;
      try {
        const profile = await getRecruiterProfile(currentUser.uid);
        setCompanyProfile(profile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRecruiter();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRequired = (skillName) => {
    const name = skillName.trim();
    if (!name) return;
    if (!requiredSkills.some(s => s.toLowerCase() === name.toLowerCase())) {
      setRequiredSkills(prev => [...prev, name]);
    }
    setNewRequiredSkill('');
  };

  const handleRemoveRequired = (skillName) => {
    setRequiredSkills(prev => prev.filter(s => s.toLowerCase() !== skillName.toLowerCase()));
  };

  const handleAddPreferred = (skillName) => {
    const name = skillName.trim();
    if (!name) return;
    if (!preferredSkills.some(s => s.toLowerCase() === name.toLowerCase())) {
      setPreferredSkills(prev => [...prev, name]);
    }
    setNewPreferredSkill('');
  };

  const handleRemovePreferred = (skillName) => {
    setPreferredSkills(prev => prev.filter(s => s.toLowerCase() !== skillName.toLowerCase()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      alert('Please add at least one required skill for compatibility matching.');
      return;
    }

    setSaving(true);
    try {
      await createOpportunity({
        recruiterId: currentUser.uid,
        companyName: companyProfile?.companyName || 'Recruiting Partner',
        title: formData.title,
        type: formData.type,
        description: formData.description,
        requiredSkills,
        preferredSkills,
        location: formData.location,
        duration: formData.duration,
        compensation: formData.compensation,
        deadline: formData.deadline,
        openings: Number(formData.openings) || 1,
      });

      navigate('/recruiter/opportunities');
    } catch (err) {
      console.error('Failed to create opportunity:', err);
      alert('Failed to publish opportunity.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Initializing form..." />;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/recruiter/opportunities')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '16px' }}
      >
        <ArrowLeft size={15} /> Back to Opportunities
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase style={{ color: 'var(--purple)' }} /> Post New Internship or Placement Vacancy
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Specify required technical competencies to enable automated candidate skill matching.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Opportunity Overview</h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Position / Job Title</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Full Stack React Developer Intern"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opportunity Type</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value={OPPORTUNITY_TYPES.INTERNSHIP}>Student Internship</option>
                <option value={OPPORTUNITY_TYPES.JOB}>Full-Time Job Placement</option>
                <option value={OPPORTUNITY_TYPES.FACULTY_INTERNSHIP}>Faculty Internship</option>
                <option value={OPPORTUNITY_TYPES.FDP}>Faculty Development Program (FDP)</option>
                <option value={OPPORTUNITY_TYPES.RESEARCH_PROJECT}>Research Collaboration Project</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Work Location / Model</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Bengaluru (Hybrid) or Remote"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                name="duration"
                className="form-input"
                placeholder="e.g. 6 Months or Full-Time"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Compensation (Stipend / CTC)</label>
              <input
                type="text"
                name="compensation"
                className="form-input"
                placeholder="e.g. ₹35,000 / month or ₹12 LPA"
                value={formData.compensation}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                className="form-input"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Vacancies / Openings</label>
              <input
                type="number"
                name="openings"
                className="form-input"
                min="1"
                value={formData.openings}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Job Description & Responsibilities</label>
            <textarea
              name="description"
              rows={4}
              className="form-textarea"
              placeholder="Detail key responsibilities, project scope, team mentorship, and daily workflows..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Required Skills Section */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
            Required Skills <span style={{ color: 'var(--danger)' }}>*</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            These skills are strictly evaluated by the skill matching engine to calculate candidate compatibility.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ flex: 1, minWidth: '180px' }}
              value=""
              onChange={(e) => handleAddRequired(e.target.value)}
            >
              <option value="">-- Add from Common Skill List --</option>
              {COMMON_SKILLS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              type="text"
              className="form-input"
              style={{ flex: 1, minWidth: '180px' }}
              placeholder="Or type custom requirement..."
              value={newRequiredSkill}
              onChange={(e) => setNewRequiredSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRequired(newRequiredSkill);
                }
              }}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleAddRequired(newRequiredSkill)}
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '42px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-subtle)' }}>
            {requiredSkills.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No required skills specified yet.</span>
            ) : (
              requiredSkills.map(skill => (
                <SkillTag
                  key={skill}
                  name={skill}
                  showIcon={false}
                  onRemove={handleRemoveRequired}
                />
              ))
            )}
          </div>
        </div>

        {/* Preferred Skills */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Preferred / Bonus Skills (Optional)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Secondary competencies that give candidates an edge in review.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, minWidth: '220px' }}
              placeholder="Type preferred bonus tool (e.g. Docker, GraphQL)..."
              value={newPreferredSkill}
              onChange={(e) => setNewPreferredSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPreferred(newPreferredSkill);
                }
              }}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleAddPreferred(newPreferredSkill)}
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '42px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-subtle)' }}>
            {preferredSkills.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No preferred skills added.</span>
            ) : (
              preferredSkills.map(skill => (
                <SkillTag
                  key={skill}
                  name={skill}
                  showIcon={false}
                  onRemove={handleRemovePreferred}
                />
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/recruiter/opportunities')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ backgroundColor: 'var(--purple)' }}
            disabled={saving}
          >
            <PlusCircle size={18} /> {saving ? 'Publishing...' : 'Publish Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
}
