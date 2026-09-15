import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getSavedOpportunities,
  getOpportunities,
  getStudentProfile,
  toggleSaveOpportunity,
} from '../../services/firestoreService';
import OpportunityCard from '../../components/OpportunityCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Bookmark, ArrowRight } from 'lucide-react';

export default function StudentSaved() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [savedOpps, setSavedOpps] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      if (!currentUser) return;
      try {
        const [savedList, allOpps, profile] = await Promise.all([
          getSavedOpportunities(currentUser.uid),
          getOpportunities(),
          getStudentProfile(currentUser.uid),
        ]);

        const oppMap = new Map(allOpps.map(o => [o.id, o]));
        const enriched = savedList
          .map(s => oppMap.get(s.opportunityId))
          .filter(Boolean);

        setSavedOpps(enriched);
        setStudentSkills(profile?.skills || []);
      } catch (err) {
        console.error('Error loading saved postings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, [currentUser]);

  const handleRemove = async (oppId) => {
    if (!currentUser) return;
    try {
      await toggleSaveOpportunity(currentUser.uid, oppId);
      setSavedOpps(prev => prev.filter(o => o.id !== oppId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading saved opportunities..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Saved Opportunities</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Review and prepare for roles you have bookmarked for later.
        </p>
      </div>

      {savedOpps.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved roles"
          description="Bookmark jobs and internships while browsing to keep track of interesting vacancies."
          action={
            <Link to="/student/opportunities" className="btn btn-primary">
              Explore Opportunities <ArrowRight size={16} />
            </Link>
          }
        />
      ) : (
        <div className="grid-2">
          {savedOpps.map(opp => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              studentSkills={studentSkills}
              isSaved={true}
              onToggleSave={() => handleRemove(opp.id)}
              onViewDetails={() => navigate(`/student/opportunities?highlight=${opp.id}`)}
              onApply={() => navigate(`/student/opportunities?apply=${opp.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
