/**
 * Core Skill Matching Engine
 * Reusable utility for calculating skill overlap, gap identification,
 * and compatibility scores between Student Competencies and Industry Job/Internship Requirements.
 */

// Common alias normalization table
const SKILL_ALIASES = {
  'js': 'javascript',
  'ts': 'typescript',
  'react.js': 'react',
  'reactjs': 'react',
  'node': 'node.js',
  'nodejs': 'node.js',
  'express': 'express.js',
  'expressjs': 'express.js',
  'py': 'python',
  'golang': 'go',
  'postgres': 'postgresql',
  'mongo': 'mongodb',
  'aws': 'cloud computing (aws/gcp)',
  'gcp': 'cloud computing (aws/gcp)',
  'cloud computing': 'cloud computing (aws/gcp)',
  'ml': 'machine learning',
  'dl': 'deep learning',
  'ai': 'artificial intelligence',
  'ui/ux': 'ui/ux design',
  'ui/ux design': 'ui/ux design',
  'figma': 'figma',
  'k8s': 'kubernetes',
};

/**
 * Normalizes a skill string for accurate comparisons
 * @param {string} skill 
 * @returns {string} normalized string
 */
export function normalizeSkill(skill) {
  if (!skill) return '';
  const cleaned = String(skill).trim().toLowerCase().replace(/[-_.]+/g, ' ');
  return SKILL_ALIASES[cleaned] || cleaned;
}

/**
 * Extracts raw skill name whether input is string or object { name, level }
 * @param {string|object} item
 * @returns {string}
 */
export function getSkillName(item) {
  if (!item) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'object' && item.name) return item.name.trim();
  return String(item).trim();
}

/**
 * Core Skill Match Calculator
 * 
 * @param {Array<string|object>} studentSkills - List of student skills (strings or objects with .name)
 * @param {Array<string>} requiredSkills - List of mandatory skills for the opportunity
 * @param {Array<string>} [preferredSkills=[]] - Optional list of preferred/bonus skills
 * @returns {Object} Matching calculation breakdown
 */
export function calculateSkillMatch(studentSkills = [], requiredSkills = [], preferredSkills = []) {
  // Normalize & deduplicate required skills
  const cleanRequired = Array.from(
    new Set((requiredSkills || []).map(s => getSkillName(s)).filter(Boolean))
  );

  // If no skills are required, match is 100%
  if (cleanRequired.length === 0) {
    return {
      matchPercentage: 100,
      matchedSkills: [],
      missingSkills: [],
      totalRequiredSkills: 0,
      matchedSkillCount: 0,
      hasProficiencyBonus: false,
    };
  }

  // Create a map of normalized student skills to their original representation & level
  const studentSkillMap = new Map();
  (studentSkills || []).forEach(item => {
    const rawName = getSkillName(item);
    if (rawName) {
      const normalized = normalizeSkill(rawName);
      const level = (typeof item === 'object' && item.level) ? item.level : 'Intermediate';
      studentSkillMap.set(normalized, { original: rawName, level });
    }
  });

  const matchedSkills = [];
  const missingSkills = [];

  cleanRequired.forEach(req => {
    const normReq = normalizeSkill(req);
    if (studentSkillMap.has(normReq)) {
      matchedSkills.push({
        name: req,
        studentProficiency: studentSkillMap.get(normReq).level,
      });
    } else {
      missingSkills.push(req);
    }
  });

  const totalRequiredSkills = cleanRequired.length;
  const matchedSkillCount = matchedSkills.length;
  const matchPercentage = Math.round((matchedSkillCount / totalRequiredSkills) * 100);

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    totalRequiredSkills,
    matchedSkillCount,
    isHighMatch: matchPercentage >= 70,
    isModerateMatch: matchPercentage >= 40 && matchPercentage < 70,
    isLowMatch: matchPercentage < 40,
  };
}

/**
 * Calculates global skill gap metrics comparing a pool of students against market demands
 * Useful for Institution Admin Analytics
 */
export function calculateCurriculumSkillGap(allStudents = [], allOpportunities = []) {
  const demandFrequency = {};
  const supplyFrequency = {};

  // Count demand from opportunities
  allOpportunities.forEach(opp => {
    (opp.requiredSkills || []).forEach(skill => {
      const norm = normalizeSkill(getSkillName(skill));
      if (norm) {
        demandFrequency[norm] = (demandFrequency[norm] || 0) + 1;
      }
    });
  });

  // Count supply from students
  allStudents.forEach(stu => {
    (stu.skills || []).forEach(skill => {
      const norm = normalizeSkill(getSkillName(skill));
      if (norm) {
        supplyFrequency[norm] = (supplyFrequency[norm] || 0) + 1;
      }
    });
  });

  const allSkills = Array.from(new Set([...Object.keys(demandFrequency), ...Object.keys(supplyFrequency)]));

  const gapAnalysis = allSkills.map(skillKey => {
    const demand = demandFrequency[skillKey] || 0;
    const supply = supplyFrequency[skillKey] || 0;
    const gap = Math.max(0, demand - supply);
    const readinessRatio = demand > 0 ? Math.min(100, Math.round((supply / demand) * 100)) : 100;

    return {
      skill: skillKey,
      displayName: skillKey.charAt(0).toUpperCase() + skillKey.slice(1),
      demandCount: demand,
      supplyCount: supply,
      gap,
      readinessRatio,
    };
  });

  // Sort by highest gap (most urgent industry demand missing from students)
  gapAnalysis.sort((a, b) => b.gap - a.gap || b.demandCount - a.demandCount);

  return gapAnalysis;
}
