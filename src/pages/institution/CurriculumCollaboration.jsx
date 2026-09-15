import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllCurriculums, createCurriculum, addCurriculumFeedback } from '../../services/firestoreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import TiltCard from '../../components/TiltCard';
import {
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Clock,
  Building,
  Award,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Send,
  Filter,
  GraduationCap,
  X,
  Radio,
} from 'lucide-react';

export default function CurriculumCollaboration() {
  const { currentUser, userRole } = useAuth();
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [reviewingCurrId, setReviewingCurrId] = useState(null);

  // New Curriculum Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Computer Science & Engineering');
  const [newCredits, setNewCredits] = useState(4);
  const [newDescription, setNewDescription] = useState('');
  const [newModules, setNewModules] = useState([
    { unit: 'Unit 1', topic: 'Core Foundations & Architectural Patterns', hours: 10 },
    { unit: 'Unit 2', topic: 'Modern Toolchains, Frameworks & Automation', hours: 12 },
    { unit: 'Unit 3', topic: 'Hands-on Industrial Capstone Project', hours: 10 },
  ]);

  // Review Form State
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    async function loadCurriculums() {
      try {
        const data = await getAllCurriculums();
        setCurriculums(data || []);
      } catch (err) {
        console.error('Failed to load curriculums:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCurriculums();
  }, []);

  const handleProposeSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await createCurriculum({
        title: newTitle,
        department: newDept,
        proposedBy: currentUser?.name ? `${currentUser.name} (Academic Council)` : 'Faculty Curriculum Board',
        academicYear: '2025-2026',
        credits: newCredits,
        description: newDescription,
        modules: newModules,
      });
      setCurriculums(prev => [created, ...prev]);
      setShowProposeModal(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      console.error('Error creating curriculum:', err);
    }
  };

  const handleFeedbackSubmit = async (currId) => {
    if (!reviewerComment.trim()) return;
    setSubmittingFeedback(true);
    try {
      const updated = await addCurriculumFeedback(currId, {
        reviewerName: currentUser?.name || 'Industry Lead Expert',
        company: currentUser?.companyName || 'Enterprise Tech Partner',
        rating: Number(reviewerRating),
        comment: reviewerComment,
      });
      if (updated) {
        setCurriculums(prev => prev.map(c => c.id === currId ? updated : c));
        setReviewingCurrId(null);
        setReviewerComment('');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return <LoadingSpinner text="Connecting to Curriculum Collaboration Hub..." />;

  const filteredCurriculums = curriculums.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status?.toLowerCase().includes(filterStatus.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '50px' }}>
      {/* Header Banner */}
      <TiltCard maxTilt={4} scale={1.006} glare={true} style={{ marginBottom: '28px' }}>
        <div className="card" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, var(--bg-glass-elevated) 0%, var(--bg-card) 100%)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                <Radio size={14} style={{ color: 'var(--primary)', animation: 'beaconPulse 1.8s infinite' }} /> SIH26044 Core Mission Live
              </div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 800 }}>
                Academia–Industry Curriculum & Syllabus Collaboration Hub 📚
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Bridging curriculum deficits by allowing universities to publish course syllabi and industry leaders to inject modern enterprise requirements.
              </p>
            </div>

            <button
              onClick={() => setShowProposeModal(true)}
              className="btn btn-primary"
              style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
            >
              <PlusCircle size={18} /> Propose New Syllabus Draft
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Filter and Metrics Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterStatus('all')}
            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px' }}
          >
            All Courses ({curriculums.length})
          </button>
          <button
            onClick={() => setFilterStatus('review')}
            className={`btn btn-sm ${filterStatus === 'review' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px' }}
          >
            Under Industry Review ({curriculums.filter(c => c.status?.includes('Review')).length})
          </button>
          <button
            onClick={() => setFilterStatus('endorsed')}
            className={`btn btn-sm ${filterStatus === 'endorsed' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px' }}
          >
            Industry Endorsed ({curriculums.filter(c => c.status?.includes('Endorsed')).length})
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredCurriculums.length}</strong> academic framework proposals
        </div>
      </div>

      {/* Curriculums Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {filteredCurriculums.map(curr => {
          const isEndorsed = curr.status?.includes('Endorsed');
          const isReviewing = reviewingCurrId === curr.id;

          return (
            <div key={curr.id} className="card" style={{ padding: '26px', border: isEndorsed ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid var(--border-color)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge" style={{
                      backgroundColor: isEndorsed ? 'rgba(52, 211, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: isEndorsed ? '#34d399' : '#60a5fa',
                      fontWeight: 700,
                    }}>
                      {isEndorsed ? '✓ Industry Endorsed' : 'Under Industry Review'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {curr.department} • {curr.credits} Credits ({curr.academicYear})
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: '0 0 6px 0', fontWeight: 800 }}>
                    {curr.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    Proposed by: <strong style={{ color: '#cbd5e1' }}>{curr.proposedBy}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', fontSize: '0.85rem', color: '#38bdf8' }}>
                    <ThumbsUp size={14} /> {curr.industryVotes?.upvotes || 0} Industry Endorsements
                  </div>

                  <button
                    onClick={() => setReviewingCurrId(isReviewing ? null : curr.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={14} /> {isReviewing ? 'Close Review' : 'Add Industry Feedback'}
                  </button>
                </div>
              </div>

              {/* Course Overview */}
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                {curr.description}
              </p>

              {/* Syllabus Units Breakdown */}
              <div style={{ marginBottom: '22px', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Syllabus Units & Lecture Modules:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {curr.modules?.map((m, idx) => (
                    <div key={idx} style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                        <span>{m.unit}</span>
                        <span>{m.hours} Hours</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#f1f5f9', fontWeight: 500 }}>
                        {m.topic}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruiter / Industry Feedback Section */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: '#fbbf24' }} /> Industry Experts' Evaluation & Recommendations ({curr.feedback?.length || 0}):
                </div>

                {(!curr.feedback || curr.feedback.length === 0) ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                    Awaiting initial corporate feedback. Be the first industry partner to review this syllabus!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {curr.feedback.map(fb => (
                      <div key={fb.id} style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                            {fb.reviewerName} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({fb.company})</span>
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>
                            ★ {fb.rating}/5 Relevance
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                          "{fb.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inline Review Form */}
              {isReviewing && (
                <div style={{ marginTop: '20px', padding: '18px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#ffffff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={16} style={{ color: '#60a5fa' }} /> Post Corporate Feedback & Skill Interventions
                  </h4>

                  <div style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Industry Relevance Rating (1 to 5 Stars)</label>
                    <select
                      className="form-select"
                      style={{ maxWidth: '200px' }}
                      value={reviewerRating}
                      onChange={(e) => setReviewerRating(e.target.value)}
                    >
                      <option value="5">★★★★★ 5 - Highly Industry Ready</option>
                      <option value="4">★★★★☆ 4 - Good with Minor Tweaks</option>
                      <option value="3">★★★☆☆ 3 - Moderate Coverage</option>
                      <option value="2">★★☆☆☆ 2 - Outdated Technologies</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Specific Recommendations & Missing Technologies</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="e.g. Strongly recommend replacing traditional socket programming in Unit 2 with Kafka message streaming and Docker containerization to match 2026 hiring standards..."
                      value={reviewerComment}
                      onChange={(e) => setReviewerComment(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => setReviewingCurrId(null)} className="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedbackSubmit(curr.id)}
                      disabled={submittingFeedback}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={14} /> {submittingFeedback ? 'Posting...' : 'Submit Industry Endorsement'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Propose Curriculum Modal */}
      {showProposeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '620px',
            padding: '28px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid var(--border-glow)',
          }}>
            <button
              onClick={() => setShowProposeModal(false)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, margin: 0 }}>
                  Propose Curriculum & Syllabus Draft
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Submit course modules to the Industry Collaborative Board for review and endorsement.
                </p>
              </div>
            </div>

            <form onSubmit={handleProposeSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Next-Gen DevOps & Cloud Architecture (CSE 406)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Credits</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    min={1}
                    max={6}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Course Description & Goals</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Outline course learning objectives, target industries, and lab requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowProposeModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish for Industry Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
