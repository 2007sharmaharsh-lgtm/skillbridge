import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateStudentProfile, getStudentProfile } from '../../services/firestoreService';
import { MOCK_QUIZZES } from '../../constants';
import { CheckCircle2, Award, ArrowRight, RotateCcw, BrainCircuit, Sparkles, HelpCircle, AlertCircle, Code2, CheckSquare } from 'lucide-react';
import LiveCodingSandbox from '../../components/LiveCodingSandbox';

export default function StudentQuiz() {
  const { currentUser } = useAuth();
  const [viewTab, setViewTab] = useState('coding'); // 'coding' | 'mcq'
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setUserAnswers({});
    setQuizCompleted(false);
    setScore(0);
    setSaveSuccess(false);
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / activeQuiz.questions.length) * 100);
    setScore(calculatedScore);
    setQuizCompleted(true);

    // If passed (score >= 60%), update student profile with targetSkill
    if (calculatedScore >= 60 && currentUser?.uid) {
      setSaving(true);
      try {
        const student = await getStudentProfile(currentUser.uid);
        const existingSkills = student?.skills || [];
        const targetSkill = activeQuiz.targetSkill;
        
        // Add skill if not present, or upgrade level
        const skillIdx = existingSkills.findIndex((s) => s.name?.toLowerCase() === targetSkill.toLowerCase());
        let updatedSkills = [...existingSkills];
        if (skillIdx >= 0) {
          updatedSkills[skillIdx] = { ...updatedSkills[skillIdx], level: 'Advanced', verified: true };
        } else {
          updatedSkills.push({ name: targetSkill, level: calculatedScore >= 80 ? 'Advanced' : 'Intermediate', verified: true });
        }

        await updateStudentProfile(currentUser.uid, { skills: updatedSkills });
        setSaveSuccess(true);
      } catch (err) {
        console.error('Failed to update student profile after quiz:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.6rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrainCircuit style={{ color: 'var(--primary)' }} /> Verified Skill Assessment & Coding Sandbox
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Evaluate hands-on algorithmic competency in the live in-browser compiler or complete technical conceptual assessments. Passing code test cases auto-verifies skills on your digital portfolio.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => { setViewTab('coding'); setActiveQuiz(null); }}
          className={`btn ${viewTab === 'coding' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', fontSize: '0.88rem' }}
        >
          <Code2 size={16} /> Live In-Browser Code Compiler (HackerRank Sandbox)
        </button>
        <button
          type="button"
          onClick={() => { setViewTab('mcq'); }}
          className={`btn ${viewTab === 'mcq' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', fontSize: '0.88rem' }}
        >
          <CheckSquare size={16} /> Conceptual MCQ Assessments ({MOCK_QUIZZES.length})
        </button>
      </div>

      {viewTab === 'coding' ? (
        <LiveCodingSandbox />
      ) : !activeQuiz ? (
        /* Quiz Selection Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {MOCK_QUIZZES.map((quiz) => (
            <div key={quiz.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    {quiz.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {quiz.questions.length} Questions
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '8px' }}>
                  {quiz.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Target Verified Skill Badge: <strong style={{ color: 'var(--primary)' }}>{quiz.targetSkill}</strong>
                </p>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz)}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '8px' }}
              >
                Start Assessment <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Active Quiz View / Result View */
        <div className="card">
          {!quizCompleted ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>{activeQuiz.title}</h3>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  Exit Quiz
                </button>
              </div>

              {activeQuiz.questions.map((q, idx) => (
                <div key={q.id} style={{ marginBottom: '24px', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '14px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Q{idx + 1}.</span> {q.question}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          style={{
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                            color: isSelected ? '#ffffff' : '#cbd5e1',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length < activeQuiz.questions.length}
                  className="btn btn-primary"
                  style={{ borderRadius: '8px', padding: '10px 24px' }}
                >
                  Submit & Score Assessment
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Completed Result */
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              {score >= 60 ? (
                <div>
                  <Award size={64} style={{ color: '#34d399', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '8px' }}>
                    Assessment Passed! Score: {score}%
                  </h3>
                  <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 20px', fontSize: '0.95rem' }}>
                    Congratulations! You demonstrated proficiency in <strong>{activeQuiz.targetSkill}</strong>. Your student profile and shareable digital portfolio have been updated with a verified badge.
                  </p>
                  {saveSuccess && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '10px 18px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} /> Profile automatically updated with verified skill: {activeQuiz.targetSkill}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <AlertCircle size={64} style={{ color: '#f59e0b', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '8px' }}>
                    Score: {score}% (Passing Threshold: 60%)
                  </h3>
                  <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 20px', fontSize: '0.95rem' }}>
                    Review the recommended industry learning modules to strengthen your skills before retaking this assessment.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => handleStartQuiz(activeQuiz)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '8px' }}
                >
                  <RotateCcw size={16} /> Retake Quiz
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="btn btn-primary"
                  style={{ borderRadius: '8px' }}
                >
                  All Assessments
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
