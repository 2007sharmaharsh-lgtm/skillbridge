import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllStudents } from '../../services/firestoreService';
import { DEPARTMENTS, COMMON_SKILLS } from '../../constants';
import SkillTag from '../../components/SkillTag';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Users, GraduationCap, MapPin, FileText, Filter, Award } from 'lucide-react';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await getAllStudents();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  if (loading) return <LoadingSpinner text="Retrieving student records..." />;

  const filteredStudents = students.filter(student => {
    if (selectedDept !== 'all' && student.branch !== selectedDept) return false;
    if (selectedYear !== 'all' && student.graduationYear !== selectedYear) return false;
    if (selectedSkill !== 'all') {
      const hasSkill = (student.skills || []).some(
        s => (s.name || s).toLowerCase() === selectedSkill.toLowerCase()
      );
      if (!hasSkill) return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = (student.name || '').toLowerCase().includes(query);
      const matchCollege = (student.collegeName || '').toLowerCase().includes(query);
      const matchBranch = (student.branch || '').toLowerCase().includes(query);
      const matchSkills = (student.skills || []).some(s => (s.name || s).toLowerCase().includes(query));
      return matchName || matchCollege || matchBranch || matchSkills;
    }
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users style={{ color: 'var(--primary)' }} /> Student Competency Directory
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Search and filter enrolled students across academic branches, graduation cohorts, and technical competencies.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
          <div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by student name or skill..."
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">All Departments / Branches</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">All Cohort Years</option>
              <option value="2024">Class of 2024</option>
              <option value="2025">Class of 2025</option>
              <option value="2026">Class of 2026</option>
              <option value="2027">Class of 2027</option>
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="all">Filter by Skill Tag</option>
              {COMMON_SKILLS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="Try broadening your department, cohort, or skill filter selections."
        />
      ) : (
        <div className="grid-2">
          {filteredStudents.map(student => (
            <div key={student.uid} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{student.name || 'Student Candidate'}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <GraduationCap size={15} />
                    <span>{student.degree} {student.branch}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                    Cohort: Class of {student.graduationYear} • {student.collegeName}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to={`/portfolio/${student.uid}`}
                    target="_blank"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Award size={13} style={{ color: 'var(--primary)' }} /> Portfolio
                  </Link>
                  {student.resumeURL && (
                    <a
                      href={student.resumeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <FileText size={13} /> Resume
                    </a>
                  )}
                </div>
              </div>

              {student.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <MapPin size={13} /> {student.location}
                </div>
              )}

              {student.about && (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {student.about}
                </p>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  VERIFIED COMPETENCIES:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(student.skills || []).length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No skills added</span>
                  ) : (
                    (student.skills || []).map(s => (
                      <SkillTag
                        key={s.name || s}
                        name={s.name || s}
                        level={s.level}
                        showIcon={false}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
