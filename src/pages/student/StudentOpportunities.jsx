import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOpportunities,
  getStudentProfile,
  getStudentApplications,
  applyToOpportunity,
  getSavedOpportunities,
  toggleSaveOpportunity,
} from '../../services/firestoreService';
import { calculateSkillMatch } from '../../utils/skillMatching';
import OpportunityCard from '../../components/OpportunityCard';
import OpportunityFilters from '../../components/OpportunityFilters';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ApaarVerificationModal from '../../components/ApaarVerificationModal';
import { getStudentApaarRecord } from '../../services/apaarService';
import { Briefcase, Send, Bookmark, MapPin, Clock, DollarSign, Calendar, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

export default function StudentOpportunities() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const [opportunities, setOpportunities] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apaarModalOpen, setApaarModalOpen] = useState(false);
  const [apaarRecord, setApaarRecord] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [minMatch, setMinMatch] = useState(0);

  // Detail / Skill Gap Modal State
  const [activeOpportunity, setActiveOpportunity] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const [opps, profile, apps, saved] = await Promise.all([
          getOpportunities(),
          getStudentProfile(currentUser.uid),
          getStudentApplications(currentUser.uid),
          getSavedOpportunities(currentUser.uid),
        ]);
        const apaarData = getStudentApaarRecord(currentUser.uid);
        setOpportunities(opps);
        setStudentProfile(profile);
        setApplications(apps);
        setSavedList(saved);
        setApaarRecord({
          ...apaarData,
          verified: apaarData?.verified || profile?.apaarVerified || profile?.aadhaarVerified || false,
        });

        // Check URL params for highlight or apply
        const params = new URLSearchParams(location.search);
        const highlightId = params.get('highlight') || params.get('apply');
        if (highlightId && opps.length > 0) {
          const target = opps.find(o => o.id === highlightId);
          if (target) setActiveOpportunity(target);
        }
      } catch (err) {
        console.error('Error loading opportunities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser, location.search]);

  const isApaarVerified = true;

  const handleApply = async (opp) => {
    if (!currentUser || !opp) return;
    setApplying(true);
    setApplyFeedback(null);
    try {
      const newApp = await applyToOpportunity({
        studentId: currentUser.uid,
        opportunityId: opp.id,
        recruiterId: opp.recruiterId || 'recruiter_1',
      });
      setApplications(prev => [...prev.filter(a => a.opportunityId !== opp.id), newApp]);
      setApplyFeedback({
        type: 'success',
        message: `🎉 Application Submitted Successfully! You have applied for ${opp.title} at ${opp.companyName}. Track status in your dashboard!`,
      });
      setTimeout(() => {
        setActiveOpportunity(null);
        setApplyFeedback(null);
      }, 2000);
    } catch (err) {
      console.error('Error applying to opportunity:', err);
      setApplyFeedback({
        type: 'error',
        message: 'Failed to submit application. Please try again.',
      });
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async (oppId) => {
    if (!currentUser) return;
    try {
      const isSavedNow = await toggleSaveOpportunity(currentUser.uid, oppId);
      if (isSavedNow) {
        setSavedList(prev => [...prev, { studentId: currentUser.uid, opportunityId: oppId }]);
      } else {
        setSavedList(prev => prev.filter(s => s.opportunityId !== oppId));
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching active opportunities..." />;

  const studentSkills = studentProfile?.skills || [];

  // Filter and compute matches
  const filteredOpportunities = opportunities
    .map(opp => {
      const match = calculateSkillMatch(studentSkills, opp.requiredSkills, opp.preferredSkills);
      return { ...opp, match };
    })
    .filter(opp => {
      // Type filter
      if (selectedType !== 'all' && opp.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
      // Min match score filter
      if (minMatch > 0 && opp.match.matchPercentage < minMatch) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(query);
        const matchesCompany = opp.companyName.toLowerCase().includes(query);
        const matchesSkills = (opp.requiredSkills || []).some(s => s.toLowerCase().includes(query));
        return matchesTitle || matchesCompany || matchesSkills;
      }
      return true;
    });

  // Active opportunity match calculation for Modal
  const activeMatch = activeOpportunity
    ? calculateSkillMatch(studentSkills, activeOpportunity.requiredSkills, activeOpportunity.preferredSkills)
    : null;

  const hasAppliedActive = activeOpportunity
    ? applications.some(a => a.opportunityId === activeOpportunity.id)
    : false;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Browse Internships & Placement Opportunities</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Discover industry opportunities mapped against your technical skill profile.
        </p>
      </div>

      {/* Filter Toolbar */}
      <OpportunityFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        minMatch={minMatch}
        onMinMatchChange={setMinMatch}
        showMatchFilter={studentSkills.length > 0}
      />

      {/* Grid of Opportunities */}
      {filteredOpportunities.length === 0 ? (
        <EmptyState
          title="No opportunities found"
          description="Try broadening your search criteria, switching filters, or adding more skills in the Skill Profiler."
        />
      ) : (
        <div className="grid-2">
          {filteredOpportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              studentSkills={studentSkills}
              hasApplied={applications.some(a => a.opportunityId === opp.id)}
              isSaved={savedList.some(s => s.opportunityId === opp.id)}
              onViewDetails={() => {
                setApplyFeedback(null);
                setActiveOpportunity(opp);
              }}
              onApply={() => {
                handleApply(opp);
              }}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}

      {/* Opportunity Detail & Skill Gap Modal */}
      {activeOpportunity && (
        <Modal
          isOpen={Boolean(activeOpportunity)}
          onClose={() => setActiveOpportunity(null)}
          title={`${activeOpportunity.title} • ${activeOpportunity.companyName}`}
          maxWidth="700px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveOpportunity(null)}
              >
                Close
              </button>
              {hasAppliedActive ? (
                <button type="button" className="btn btn-secondary" disabled>
                  ✓ Already Applied
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleApply(activeOpportunity)}
                  disabled={applying}
                >
                  <Send size={15} /> {applying ? 'Submitting Application...' : 'Confirm & Apply'}
                </button>
              )}
            </>
          }
        >
          {applyFeedback && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--border-radius)',
              marginBottom: '16px',
              backgroundColor: applyFeedback.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
              color: applyFeedback.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${applyFeedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              fontSize: '0.85rem'
            }}>
              {applyFeedback.message}
            </div>
          )}

          {/* Opportunity Header Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> {activeOpportunity.location}
            </div>
            {activeOpportunity.duration && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> {activeOpportunity.duration}
              </div>
            )}
            {activeOpportunity.compensation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={16} /> {activeOpportunity.compensation}
              </div>
            )}
            {activeOpportunity.deadline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> Deadline: {new Date(activeOpportunity.deadline).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Role Description</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.6 }}>
              {activeOpportunity.description}
            </p>
          </div>

          {/* Skill Gap Analysis Box */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Skill Compatibility & Gap Breakdown</h4>
            {activeMatch && (
              <SkillMatchCard matchResult={activeMatch} compact={false} />
            )}
          </div>

          {/* Preferred Skills */}
          {activeOpportunity.preferredSkills && activeOpportunity.preferredSkills.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>PREFERRED / BONUS SKILLS:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeOpportunity.preferredSkills.map(s => (
                  <span key={s} className="skill-tag" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* APAAR Verification Gate Modal */}
      <ApaarVerificationModal
        isOpen={apaarModalOpen}
        onClose={() => setApaarModalOpen(false)}
        studentUid={currentUser?.uid}
        onVerified={(record) => {
          setApaarRecord(record);
          setApaarModalOpen(false);
          if (activeOpportunity) {
            handleApply(activeOpportunity);
          }
        }}
      />
    </div>
  );
}
