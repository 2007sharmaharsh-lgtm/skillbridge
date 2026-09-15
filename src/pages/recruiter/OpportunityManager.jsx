import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOpportunities,
  deleteOpportunity,
  updateOpportunity,
  getRecruiterApplications,
} from '../../services/firestoreService';
import OpportunityCard from '../../components/OpportunityCard';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Briefcase, PlusCircle, Users, Edit3, Trash2, Calendar, MapPin } from 'lucide-react';

export default function OpportunityManager() {
  const { currentUser } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal state
  const [editingOpp, setEditingOpp] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    async function loadOpps() {
      if (!currentUser) return;
      try {
        const [opps, apps] = await Promise.all([
          getOpportunities({ recruiterId: currentUser.uid }),
          getRecruiterApplications(currentUser.uid),
        ]);
        setOpportunities(opps);
        setApplications(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOpps();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await deleteOpportunity(id);
      setOpportunities(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingOpp) return;
    setSavingEdit(true);
    try {
      await updateOpportunity(editingOpp.id, editingOpp);
      setOpportunities(prev => prev.map(o => o.id === editingOpp.id ? editingOpp : o));
      setEditingOpp(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading published postings..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Manage Opportunities</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track active openings, edit requirements, and review applicant pipelines.
          </p>
        </div>

        <Link to="/recruiter/opportunities/create" className="btn btn-primary" style={{ backgroundColor: 'var(--purple)' }}>
          <PlusCircle size={16} /> Post New Opportunity
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description="Create your first internship or job vacancy to start receiving matched candidates."
          action={
            <Link to="/recruiter/opportunities/create" className="btn btn-primary">
              Post Opportunity
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {opportunities.map(opp => {
            const oppApps = applications.filter(a => a.opportunityId === opp.id);
            return (
              <div key={opp.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)', backgroundColor: 'var(--purple-light)', padding: '2px 8px', borderRadius: '4px' }}>
                        {opp.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                        ● Active
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{opp.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {opp.location}</span>
                      <span>•</span>
                      <span>{opp.openings} Openings</span>
                      <span>•</span>
                      <span>{opp.compensation}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Link
                      to={`/recruiter/applicants?opportunityId=${opp.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Users size={15} /> Applicants ({oppApps.length})
                    </Link>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setEditingOpp({ ...opp })}
                    >
                      <Edit3 size={15} /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(opp.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MANDATORY SKILLS:</span>
                  {(opp.requiredSkills || []).map(s => (
                    <span key={s} className="skill-tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Opportunity Modal */}
      {editingOpp && (
        <Modal
          isOpen={Boolean(editingOpp)}
          onClose={() => setEditingOpp(null)}
          title={`Edit Opportunity: ${editingOpp.title}`}
          maxWidth="650px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingOpp(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdate}
                disabled={savingEdit}
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Position Title</label>
              <input
                type="text"
                className="form-input"
                value={editingOpp.title}
                onChange={(e) => setEditingOpp(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={editingOpp.location}
                onChange={(e) => setEditingOpp(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Compensation</label>
              <input
                type="text"
                className="form-input"
                value={editingOpp.compensation}
                onChange={(e) => setEditingOpp(prev => ({ ...prev, compensation: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Openings</label>
              <input
                type="number"
                className="form-input"
                value={editingOpp.openings}
                onChange={(e) => setEditingOpp(prev => ({ ...prev, openings: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={editingOpp.description}
              onChange={(e) => setEditingOpp(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
