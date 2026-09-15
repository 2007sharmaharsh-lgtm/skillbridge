import React, { useState, useEffect } from 'react';
import { getAllStudents, getOpportunities, getAllApplications } from '../../services/firestoreService';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { TrendingUp, Users, CheckCircle2, Award, Briefcase, GraduationCap, Download } from 'lucide-react';

export default function PlacementTracker() {
  const [students, setStudents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allStudents, allOpps, allApps] = await Promise.all([
          getAllStudents(),
          getOpportunities(),
          getAllApplications(),
        ]);
        setStudents(allStudents);
        setOpportunities(allOpps);
        setApplications(allApps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Branch', 'Graduation Year', 'Opportunity Title', 'Company', 'Type', 'Applied Date', 'Status'];
    const oppMap = new Map(opportunities.map(o => [o.id, o]));
    const studentMap = new Map(students.map(s => [s.uid, s]));

    const rows = applications.map(app => {
      const student = studentMap.get(app.studentId) || {};
      const opp = oppMap.get(app.opportunityId) || {};
      return [
        `"${student.name || 'Candidate'}"`,
        `"${student.branch || ''}"`,
        `"${student.graduationYear || ''}"`,
        `"${opp.title || ''}"`,
        `"${opp.companyName || ''}"`,
        `"${opp.type || ''}"`,
        `"${new Date(app.appliedAt).toLocaleDateString()}"`,
        `"${app.status || ''}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `placement_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner text="Compiling placement metrics..." />;

  const oppMap = new Map(opportunities.map(o => [o.id, o]));
  const studentMap = new Map(students.map(s => [s.uid, s]));

  // Categorize applications
  const internshipApps = applications.filter(a => {
    const opp = oppMap.get(a.opportunityId);
    return opp && opp.type === 'Internship';
  });

  const jobApps = applications.filter(a => {
    const opp = oppMap.get(a.opportunityId);
    return opp && opp.type === 'Job';
  });

  const shortlistedApps = applications.filter(a => a.status === 'shortlisted' || a.status === 'interview');
  const selectedApps = applications.filter(a => a.status === 'selected');

  // Unique counts
  const totalStudents = students.length;
  const seekingStudents = new Set(applications.map(a => a.studentId)).size;
  const uniqueSelectedStudents = new Set(selectedApps.map(a => a.studentId)).size;
  const placementRate = totalStudents > 0 ? Math.round((uniqueSelectedStudents / totalStudents) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp style={{ color: 'var(--success)' }} /> Institutional Placement & Internship Tracker
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time metrics tracking campus interview cycles, internship conversions, and final employment offers.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn btn-primary"
          style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={16} /> Export CSV Placement Report
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Enrolled Students</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {totalStudents}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all engineering departments
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Students Seeking Opportunities</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
            {seekingStudents}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Actively applied to campus drives
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Students Selected / Hired</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>
            {uniqueSelectedStudents} <span style={{ fontSize: '1rem', fontWeight: 600 }}>({placementRate}% Rate)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified industry hiring outcomes
          </div>
        </div>
      </div>

      {/* Sub-Metrics Grid */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Internship Applications</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--purple)', marginTop: '4px' }}>
            {internshipApps.length}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Job Applications</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
            {jobApps.length}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shortlisted / Interview</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--warning)', marginTop: '4px' }}>
            {shortlistedApps.length}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Final Offer Letters</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>
            {selectedApps.length}
          </div>
        </div>
      </div>

      {/* Applications Audit Trail Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Campus Applications & Outcome Audit Log</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Complete record of all student applications, employer interviews, and placement decisions
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Candidate</th>
                <th>Branch / Cohort</th>
                <th>Opportunity</th>
                <th>Employer / Company</th>
                <th>Type</th>
                <th>Application Date</th>
                <th>Outcome Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No student applications recorded yet.
                  </td>
                </tr>
              ) : (
                applications.map(app => {
                  const student = studentMap.get(app.studentId) || {};
                  const opp = oppMap.get(app.opportunityId) || {};

                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{student.name || 'Candidate'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {student.branch || 'Eng'} ({student.graduationYear || '2025'})
                      </td>
                      <td>{opp.title || 'Role'}</td>
                      <td>{opp.companyName || 'Company'}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-subtle)' }}>
                          {opp.type || 'N/A'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td><ApplicationStatusBadge status={app.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
