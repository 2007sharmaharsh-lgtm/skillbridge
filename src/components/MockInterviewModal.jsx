import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Video,
  Mic,
  MicOff,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  X,
  Volume2,
  Award,
} from 'lucide-react';

const INTERVIEW_DOMAINS = [
  {
    id: 'fullstack',
    title: 'Full-Stack Software Engineering',
    role: 'Full-Stack Developer',
    questions: [
      {
        id: 'q1',
        question: 'Can you explain the Virtual DOM in React and how reconciliation works when state changes?',
        keywords: ['virtual dom', 'diffing', 'reconciliation', 'batching', 'fiber', 'render'],
      },
      {
        id: 'q2',
        question: 'How do you design a high-concurrency Node.js REST API with rate limiting and database indexing?',
        keywords: ['event loop', 'redis', 'indexing', 'rate limiting', 'middleware', 'cluster'],
      },
      {
        id: 'q3',
        question: 'Walk me through a difficult debugging scenario you faced in a recent project. How did you isolate the root cause?',
        keywords: ['profiling', 'logs', 'breakpoints', 'reproduction', 'fix', 'testing'],
      },
    ],
  },
  {
    id: 'cloud_devops',
    title: 'Cloud Architecture & DevOps',
    role: 'Cloud / DevOps Engineer',
    questions: [
      {
        id: 'q1',
        question: 'What are the core differences between a Docker container and a virtual machine?',
        keywords: ['kernel', 'hypervisor', 'namespaces', 'cgroups', 'isolation', 'overhead'],
      },
      {
        id: 'q2',
        question: 'Explain how you configure a Zero-Downtime Blue/Green deployment using Kubernetes and an Ingress controller.',
        keywords: ['rolling update', 'service', 'ingress', 'traffic routing', 'health check', 'replica'],
      },
    ],
  },
  {
    id: 'dsa_core',
    title: 'Data Structures & Algorithms',
    role: 'Algorithms & Problem Solving',
    questions: [
      {
        id: 'q1',
        question: 'How would you detect a cycle in a singly linked list with O(1) auxiliary space?',
        keywords: ['two pointers', 'fast and slow', 'floyd', 'cycle detection', 'o(1) space'],
      },
      {
        id: 'q2',
        question: 'Explain the difference between Dijkstra and Bellman-Ford shortest path algorithms.',
        keywords: ['greedy', 'dynamic programming', 'negative weights', 'relaxation', 'complexity'],
      },
    ],
  },
];

export default function MockInterviewModal({ isOpen, onClose }) {
  const [selectedDomain, setSelectedDomain] = useState(INTERVIEW_DOMAINS[0]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isOpen && !evaluationResult && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, evaluationResult, timerSeconds]);

  if (!isOpen) return null;

  const currentQ = selectedDomain.questions[currentQuestionIdx];

  const handleDomainChange = (domainId) => {
    const domain = INTERVIEW_DOMAINS.find((d) => d.id === domainId);
    if (domain) {
      setSelectedDomain(domain);
      setCurrentQuestionIdx(0);
      setUserAnswer('');
      setEvaluationResult(null);
      setTimerSeconds(120);
    }
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time speech transcription
      setTimeout(() => {
        setUserAnswer((prev) =>
          prev
            ? `${prev} In addition, we optimize render performance using memoization and virtualized lists.`
            : `To answer this question, the key architectural concept involves maintaining an in-memory representation of the UI elements. When state changes occur, a diffing algorithm calculates the minimal set of DOM mutations needed.`
        );
        setIsRecording(false);
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);

    setTimeout(() => {
      const lower = userAnswer.toLowerCase();
      let matchedCount = 0;
      currentQ.keywords.forEach((kw) => {
        if (lower.includes(kw.toLowerCase())) matchedCount += 1;
      });

      const keywordScore = Math.min(40, Math.round((matchedCount / currentQ.keywords.length) * 40));
      const lengthScore = Math.min(30, Math.round((userAnswer.length / 150) * 30));
      const clarityScore = 25;
      const totalScore = Math.min(98, keywordScore + lengthScore + clarityScore);

      const feedback = [];
      if (matchedCount >= 3) {
        feedback.push('✓ Excellent articulation of core technical concepts and vocabulary.');
      } else {
        feedback.push(`⚠ Consider mentioning key terms such as "${currentQ.keywords.slice(0, 3).join(', ')}".`);
      }

      if (userAnswer.length > 100) {
        feedback.push('✓ Solid explanation depth with practical architectural context.');
      } else {
        feedback.push('⚠ Provide a more comprehensive response with a concrete code or project example.');
      }

      setEvaluationResult({
        score: totalScore,
        technicalDepth: totalScore >= 75 ? 'Advanced (Tier 1 Ready)' : 'Competent',
        feedback,
      });
      setIsEvaluating(false);
    }, 1200);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < selectedDomain.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setUserAnswer('');
      setEvaluationResult(null);
      setTimerSeconds(120);
    } else {
      // Completed all questions
      setCurrentQuestionIdx(0);
      setUserAnswer('');
      setEvaluationResult(null);
      setTimerSeconds(120);
    }
  };

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '820px',
        padding: '28px',
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: '1px solid var(--border-glow)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
              <BrainCircuit size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800, margin: 0 }}>
                AI Mock Interview & Technical Practice Room
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Rehearse industry questions, test your voice & answers, and get real-time AI scoring.
              </p>
            </div>
          </div>

          {/* Domain Selector */}
          <div>
            <select
              className="form-select"
              value={selectedDomain.id}
              onChange={(e) => handleDomainChange(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}
            >
              {INTERVIEW_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>{d.role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Virtual Interviewer Display Card */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          marginBottom: '20px',
          display: 'flex',
          gap: '18px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#1e293b',
            border: '2px solid #38bdf8',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            flexShrink: 0,
          }}>
            <BrainCircuit size={32} />
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Question {currentQuestionIdx + 1} of {selectedDomain.questions.length} • {selectedDomain.role}
              </span>
              <span style={{ fontSize: '0.8rem', color: timerSeconds < 30 ? '#ef4444' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                <Clock size={14} /> {formatTimer(timerSeconds)}
              </span>
            </div>

            <h4 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>
              "{currentQ.question}"
            </h4>
          </div>
        </div>

        {/* Answer Input Area */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', margin: 0 }}>
              Your Response (Speak or Type):
            </label>

            <button
              type="button"
              onClick={handleToggleRecord}
              className={`btn btn-sm ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              {isRecording ? 'Recording Speech (Simulated)...' : 'Dictate with Voice'}
            </button>
          </div>

          <textarea
            rows={5}
            className="form-textarea"
            placeholder="Type your technical answer here or click 'Dictate with Voice' to speak naturally..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            style={{ width: '100%', borderRadius: '10px' }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setUserAnswer('');
              setEvaluationResult(null);
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Reset Response
          </button>

          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || !userAnswer.trim()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 700 }}
          >
            <Sparkles size={16} /> {isEvaluating ? 'Evaluating with AI...' : 'Submit Response & Analyze'}
          </button>
        </div>

        {/* AI Evaluation Telemetry Report */}
        {evaluationResult && (
          <div className="card" style={{
            padding: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  AI Technical Evaluation Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '2px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: evaluationResult.score >= 75 ? '#34d399' : '#fbbf24' }}>
                    {evaluationResult.score}/100
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {evaluationResult.technicalDepth}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
              >
                Next Question <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {evaluationResult.feedback.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {f.startsWith('✓') ? (
                    <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  ) : (
                    <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
                  )}
                  <span>{f.replace(/^[✓⚠]\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
