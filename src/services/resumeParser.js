/**
 * Resume Parser & ATS Compatibility Scorer (SIH26044)
 * Client-side heuristic parser extracting contact, education, skills, and ATS score from text/files.
 */

export const KNOWN_TECHNICAL_SKILLS = [
  // Frontend
  'React', 'React.js', 'React Native', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS',
  'Next.js', 'Vue.js', 'Angular', 'Redux', 'Bootstrap', 'Sass', 'Webpack', 'Vite', 'GraphQL',
  // Backend
  'Node.js', 'Express.js', 'Python', 'Django', 'FastAPI', 'Flask', 'Java', 'Spring Boot',
  'C++', 'C#', '.NET', 'Go', 'Golang', 'PHP', 'Ruby on Rails', 'Rust', 'REST APIs', 'Microservices',
  // Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'SQLite', 'Oracle', 'Elasticsearch', 'DynamoDB',
  // Cloud & DevOps
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
  'Git', 'GitHub', 'GitLab', 'Linux', 'Terraform', 'Nginx', 'Jenkins',
  // Data Science & AI
  'Machine Learning', 'Deep Learning', 'Data Analysis', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch',
  'Scikit-Learn', 'Natural Language Processing', 'NLP', 'Computer Vision', 'OpenCV', 'Power BI', 'Tableau',
  // Core & Soft Skills
  'Data Structures', 'Algorithms', 'Object-Oriented Programming', 'OOP', 'System Design',
  'Agile', 'Scrum', 'Problem Solving', 'Communication', 'Team Leadership'
];

/**
 * Parses raw text extracted from a resume file.
 * @param {string} rawText
 * @returns {object} Extracted candidate info, skills, and ATS rating
 */
export function parseResumeText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      name: '',
      email: '',
      phone: '',
      education: '',
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      extractedSkills: [],
      about: '',
      atsScore: 0,
      atsFeedback: ['Could not extract text from document.'],
    };
  }

  const cleanText = rawText.replace(/\r\n/g, '\n');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Extract Email
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Extract Phone Number (Indian & International formats)
  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10}|\b\d{10}\b/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 2b. Extract LinkedIn & GitHub URLs
  const linkedinMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+/i);
  let linkedinUrl = linkedinMatch ? linkedinMatch[0] : '';
  if (linkedinUrl && !linkedinUrl.startsWith('http')) linkedinUrl = `https://${linkedinUrl}`;

  const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  let githubUrl = githubMatch ? githubMatch[0] : '';
  if (githubUrl && !githubUrl.startsWith('http')) githubUrl = `https://${githubUrl}`;

  // 3. Extract Name (Heuristic: usually in first 3 lines, excluding emails/links)
  let name = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      line.length > 2 &&
      line.length < 35 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum') &&
      !/\d/.test(line)
    ) {
      name = line;
      break;
    }
  }

  // 4. Extract Degree & Branch
  let degree = 'B.Tech';
  if (/m\.?\s?tech|master of technology/i.test(cleanText)) degree = 'M.Tech';
  else if (/b\.?\s?c\.?\s?a|bachelor of computer applications/i.test(cleanText)) degree = 'BCA';
  else if (/m\.?\s?c\.?\s?a|master of computer applications/i.test(cleanText)) degree = 'MCA';
  else if (/b\.?\s?s\.?|bachelor of science/i.test(cleanText)) degree = 'B.Sc';

  let branch = 'Computer Science & Engineering';
  if (/information technology|it\b/i.test(cleanText)) branch = 'Information Technology';
  else if (/artificial intelligence|data science|ai\s*&\s*ml/i.test(cleanText)) branch = 'AI & Data Science';
  else if (/electronics|ece|electrical/i.test(cleanText)) branch = 'Electronics & Communication';
  else if (/mechanical/i.test(cleanText)) branch = 'Mechanical Engineering';

  // 5. Extract Skills
  const lowerText = cleanText.toLowerCase();
  const detectedSkillSet = new Set();

  KNOWN_TECHNICAL_SKILLS.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
    if (regex.test(lowerText)) {
      detectedSkillSet.add(skill);
    }
  });

  const extractedSkills = Array.from(detectedSkillSet).map(s => ({
    name: s,
    level: 'Intermediate',
    verified: false,
  }));

  // 6. Extract Candidate Summary / About
  let about = '';
  const summaryHeaderIdx = lines.findIndex(l => /summary|objective|profile|about me/i.test(l));
  if (summaryHeaderIdx >= 0 && summaryHeaderIdx + 1 < lines.length) {
    about = lines.slice(summaryHeaderIdx + 1, summaryHeaderIdx + 4).join(' ');
  }

  // 7. Compute ATS Score (0 - 100)
  let atsScore = 0;
  const atsFeedback = [];

  if (name) {
    atsScore += 15;
    atsFeedback.push('✓ Candidate name detected successfully.');
  } else {
    atsFeedback.push('⚠ Name not clearly recognized in top header.');
  }

  if (email) {
    atsScore += 15;
    atsFeedback.push('✓ Valid contact email address found.');
  } else {
    atsFeedback.push('⚠ Missing professional email address.');
  }

  if (phone) {
    atsScore += 10;
    atsFeedback.push('✓ Phone number present.');
  } else {
    atsFeedback.push('⚠ Contact phone number not detected.');
  }

  if (extractedSkills.length >= 5) {
    atsScore += 30;
    atsFeedback.push(`✓ Strong technical keywords count (${extractedSkills.length} competencies identified).`);
  } else if (extractedSkills.length > 0) {
    atsScore += 15;
    atsFeedback.push(`⚠ Moderate keyword density (${extractedSkills.length} skills found). Add more framework/tool keywords.`);
  } else {
    atsFeedback.push('⚠ Low technical keyword count. Ensure tools and frameworks are listed.');
  }

  if (/education|college|university|b\.tech|bachelor|degree/i.test(cleanText)) {
    atsScore += 15;
    atsFeedback.push('✓ Academic credentials section detected.');
  }

  if (/experience|internship|project|work history/i.test(cleanText)) {
    atsScore += 15;
    atsFeedback.push('✓ Project and practical work experience section found.');
  } else {
    atsFeedback.push('⚠ Add a distinct "Projects" or "Work Experience" section.');
  }

  if (linkedinUrl || githubUrl) {
    atsScore += 10;
    atsFeedback.push('✓ Professional profiles (LinkedIn / GitHub) detected.');
  }

  return {
    name,
    email,
    phone,
    linkedinUrl,
    githubUrl,
    degree,
    branch,
    extractedSkills,
    about: about.slice(0, 300),
    atsScore: Math.min(100, atsScore),
    atsFeedback,
  };
}

/**
 * Extracts plain text from a File object
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function readResumeFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    const reader = new FileReader();

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
      return;
    }

    reader.onload = (e) => {
      const buffer = e.target.result;
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(buffer);
      const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      resolve(printable);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}
