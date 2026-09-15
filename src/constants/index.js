export const ROLES = {
  STUDENT: 'student',
  RECRUITER: 'recruiter',
  ACADEMICIAN: 'academician',
  INSTITUTION_ADMIN: 'institution_admin',
};

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  SELECTED: 'selected',
  REJECTED: 'rejected',
};

export const APPLICATION_STATUS_LABELS = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview Scheduled',
  selected: 'Selected / Hired',
  rejected: 'Rejected',
};

export const SKILL_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const OPPORTUNITY_TYPES = {
  INTERNSHIP: 'Internship',
  JOB: 'Job',
  FACULTY_INTERNSHIP: 'Faculty Internship',
  FDP: 'Faculty Development Program',
  RESEARCH_PROJECT: 'Research Collaboration',
};

export const COMMON_SKILLS = [
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express.js',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Machine Learning',
  'Deep Learning',
  'Data Analysis',
  'Cloud Computing (AWS/GCP)',
  'Docker',
  'Kubernetes',
  'Cybersecurity',
  'UI/UX Design',
  'Figma',
  'Git & GitHub',
  'DevOps',
  'REST APIs',
  'Spring Boot',
  'Flutter',
];

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Data Science & AI',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const MOCK_QUIZZES = [
  {
    id: 'quiz_fullstack',
    title: 'Full Stack Web Development Skill Assessment',
    category: 'Technical Skills',
    targetSkill: 'React',
    questions: [
      {
        id: 'q1',
        question: 'Which Hook in React is used to manage side effects like fetching data or DOM updates?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'What is the primary function of Virtual DOM in React?',
        options: [
          'Directly modify real DOM elements faster',
          'Minimize real DOM manipulation by computing UI diffs',
          'Bypass JavaScript engine execution',
          'Store application data in local storage'
        ],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: 'In REST API design, which HTTP method should be idempotent when updating a resource completely?',
        options: ['POST', 'PUT', 'GET', 'DELETE'],
        correctIndex: 1,
      }
    ]
  },
  {
    id: 'quiz_datascience',
    title: 'Data Science & Machine Learning Fundamentals',
    category: 'Analytics & AI',
    targetSkill: 'Machine Learning',
    questions: [
      {
        id: 'q1',
        question: 'Which technique is used to reduce overfitting in decision trees?',
        options: ['Pruning', 'Boosting', 'Padding', 'One-Hot Encoding'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        question: 'Which Python library is primarily used for multi-dimensional array processing and linear algebra?',
        options: ['Pandas', 'NumPy', 'Matplotlib', 'Scikit-Learn'],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: 'What metric is best suited for evaluating an imbalanced classification problem?',
        options: ['Accuracy Rate', 'F1-Score / Precision-Recall', 'Mean Squared Error', 'R-Squared Score'],
        correctIndex: 1,
      }
    ]
  },
  {
    id: 'quiz_softskills',
    title: 'Professional Communication & Problem Solving',
    category: 'Soft Skills',
    targetSkill: 'Communication',
    questions: [
      {
        id: 'q1',
        question: 'When presenting technical roadmaps to non-technical stakeholders, what is the best approach?',
        options: [
          'Use detailed code snippets and technical jargon',
          'Focus on business value, key metrics, and high-level architecture',
          'Skip Q&A to save meeting time',
          'Send raw database logs as proof of concept'
        ],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'What is effective active listening during technical code reviews?',
        options: [
          'Defending code choices instantly without hearing feedback',
          'Understanding reviewer rationale, asking clarifying questions, and acknowledging valid points',
          'Ignoring comments and approving your own pull request',
          'Deleting the repository'
        ],
        correctIndex: 1,
      }
    ]
  }
];

export const MOCK_LEARNING_PROGRAMS = [
  {
    id: 'prog_aws_cloud',
    provider: 'Amazon Web Services (AWS)',
    title: 'Cloud DevOps & Infrastructure Certification Prep',
    duration: '4 Weeks',
    level: 'Intermediate',
    type: 'Industry Certification',
    skillsProvided: ['Cloud Computing (AWS/GCP)', 'Docker', 'DevOps'],
    enrolledCount: 1240,
    rating: 4.8,
    description: 'Learn container orchestration, CI/CD pipelines, and cloud architecture hands-on with AWS certified solution architects.'
  },
  {
    id: 'prog_google_ai',
    provider: 'Google AI Academy',
    title: 'Applied Generative AI & LLM Fine-Tuning Workshop',
    duration: '2 Weeks',
    level: 'Advanced',
    type: 'Live Workshop',
    skillsProvided: ['Machine Learning', 'Deep Learning', 'Python'],
    enrolledCount: 3100,
    rating: 4.9,
    description: 'Master prompt engineering, RAG pipelines, and model deployment using TensorFlow and Google Cloud Vertex AI.'
  },
  {
    id: 'prog_meta_react',
    provider: 'Meta Tech Programs',
    title: 'Enterprise Frontend Architecture & Performance',
    duration: '3 Weeks',
    level: 'Intermediate',
    type: 'Industry Certificate',
    skillsProvided: ['React', 'TypeScript', 'REST APIs'],
    enrolledCount: 2850,
    rating: 4.7,
    description: 'Deep dive into micro-frontends, state optimization, and modern React 18 patterns.'
  }
];

