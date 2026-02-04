/**
 * Subject Normalization Map
 * 
 * This maps raw subject names from the dataset to canonical academic subjects
 * suitable for parent-facing filters.
 * 
 * Rules:
 * - Only academic subjects (no program names, marketing labels, or branded courses)
 * - Remove qualifiers like "O Level", "IP", "IB", "H1/H2"
 * - Consolidate variations (Math/Maths/Mathematics)
 * - Return null for non-subjects (will be filtered out)
 */

const CANONICAL_SUBJECTS = {
  // Mathematics variants
  'Math': 'Mathematics',
  'Maths': 'Mathematics',
  'Mathematics': 'Mathematics',
  'Mathematics (GEP)': 'Mathematics',
  'Mathematics (IP)': 'Mathematics',
  'Mathematics (IB Diploma HL/SL)': 'Mathematics',
  'Express Math': 'Mathematics',
  'IP Math': 'Mathematics',
  
  // Elementary Mathematics
  'E Math': 'Elementary Mathematics',
  'E-Math': 'Elementary Mathematics',
  'Elementary Math': 'Elementary Mathematics',
  'Elementary Mathematics': 'Elementary Mathematics',
  'Elementary Mathematics (O Level)': 'Elementary Mathematics',
  'IGCSE E-Math': 'Elementary Mathematics',
  
  // Additional Mathematics
  'A Math': 'Additional Mathematics',
  'A-Math': 'Additional Mathematics',
  'A- Math': 'Additional Mathematics',
  'Additional Math': 'Additional Mathematics',
  'Additional Mathematics': 'Additional Mathematics',
  'Additional Mathematics (O Level)': 'Additional Mathematics',
  'IGCSE A- Math': 'Additional Mathematics',
  'Excellence in Additional Mathematics': 'Additional Mathematics',
  
  // English
  'English': 'English',
  'English (O level)': 'English',
  'English (IP)': 'English',
  'Express English': 'English',
  'IP English': 'English',
  'Excellence in English': 'English',
  'Excellence in English (IP)': 'English',
  
  // Chinese
  'Chinese': 'Chinese',
  'Chinese (Normal/Express/HCL)': 'Chinese',
  'Higher Chinese': 'Chinese',
  'O Level Higher Chinese': 'Chinese',
  
  // Science
  'Science': 'Science',
  'Science (GEP)': 'Science',
  'Science (IP)': 'Science',
  'Science (IB Diploma HL/SL)': 'Science',
  'Science (Chem/Physics)': 'Science',
  'IP/Express Science': 'Science',
  'Express Science': 'Science',
  'IP Science': 'Science',
  'Science and Mathematics': 'Science',
  'Excellence in Science': 'Science',
  
  // Combined Science
  'Combined Science': 'Combined Science',
  'Combined Science (Physics / Chemistry)': 'Combined Science',
  'Combined': 'Combined Science',
  'IGCSE Combined': 'Combined Science',
  
  // Physics
  'Physics': 'Physics',
  'Pure Physics': 'Physics',
  'Physics (O Level)': 'Physics',
  'Physics (IP)': 'Physics',
  'Physics (IB Diploma HL/SL)': 'Physics',
  'Secondary Physics': 'Physics',
  'IGCSE Pure': 'Physics', // Assuming Pure refers to Physics in IGCSE context
  
  // Chemistry
  'Chemistry': 'Chemistry',
  'Pure Chemistry': 'Chemistry',
  'Chemistry (O Level)': 'Chemistry',
  'Chemistry (IP)': 'Chemistry',
  'Chemistry (IB Diploma HL/SL)': 'Chemistry',
  
  // Biology
  'Biology': 'Biology',
  'Pure Biology': 'Biology',
  'Biology (O Level)': 'Biology',
  'Biology (IP)': 'Biology',
  'Biology (IB Diploma HL/SL)': 'Biology',
  'Biology)': 'Biology', // Malformed entry
  
  // Economics
  'Economics': 'Economics',
  
  // General Paper
  'General Paper': 'General Paper',
  'General Paper (GP)': 'General Paper',
  'General Paper English': 'General Paper',
  
  // Accounting
  'Principles of Accounting': 'Accounting',
  'Principle of Accounts (POA)': 'Accounting',
  'POA': 'Accounting',
  'Accounting': 'Accounting',
  
  // Geography
  'Geography': 'Geography',
  
  // History
  'History': 'History',
  
  // Literature
  'Literature': 'Literature',
  'Literature in English': 'Literature',
  
  // Social Studies
  'Social Studies': 'Social Studies',
  
  // Tamil
  'Tamil': 'Tamil',
  
  // China Studies
  'China Studies in English': 'China Studies',
  
  // ========================================================================
  // NON-SUBJECTS (Program names, marketing labels, branded courses)
  // These return null and will be filtered out
  // ========================================================================
  
  // Program names
  'Chinese 4Cs': null,
  'Higher Chinese 4Cs': null,
  'PSLE A* Writer': null,
  'P1 Mighty Reader': null,
  'P5 & 6 Sci Boost': null,
  'P5 Math-Booster': null,
  'P6 Science Mock Exam': null,
  'PSLE Mathematics Preparation': null,
  'Young Science Explorers': null,
  'S4 AMath Intensive Revision': null,
  'S4 Pure Physics Intensive Revision': null,
  'Chinese Enrichment': null,
  'Chinese Language Enrichment Program': null,
  'Chinese Public Speaking': null,
  'Chinese Essay Writing': null,
  'Chinese Workshop': null,
  'English Workshop': null,
  'Master Chinese for Exams & Beyond': null,
  'Excellence in Writing': null,
  'Excellence in Mathematics': 'Mathematics', // This one is actually Math
  
  // Skill components (too granular)
  'Creative Writing': null,
  'Comprehension': null,
  'Grammar and Sentence Construction': null,
  'Oral': null,
  'Vocabulary': null,
  'Paper 1': null,
  'Paper 2': null,
  'Paper 1 – Writing (Editing, Situational Writing, Continuous Writing)': null,
  'Paper 2 – Comprehension': null,
  'Paper 3 – Listening Comprehension': null,
  'Paper 4 – Oral Communication (Reading Aloud & Spoken Interaction)': null,
  
  // Math topics (too granular)
  'Numbers': null,
  'Addition, Subtraction & Early Multiplication': null,
  'Money': null,
  'Measurement and Geometry': null,
  'Statistics': null,
  'Factors and Multiples': null,
  'Four Operations': null,
  'Fractions': null,
  'Decimals': null,
  '2D and 3D Shapes & Nets': null,
  'Time and Area': null,
  'Algebra': null,
  'Computational Fluency': null,
  'Times Tables': null,
  'Fractions and Decimals': null,
  'Reasoning': null,
  'Problem Solving': null,
  'Positive and Negative Numbers': null,
  'Ratio': null,
  'Fractions and Percentages': null,
  'Equations': null,
  'Graphing': null,
  
  // Malformed or category labels
  'Primary': null,
  'Secondary': null,
  'H1': null,
  'H2': null,
  'IB SL': null,
  'IB HL': null,
  'Sciences (Physics': null, // Malformed
  'Pure': null, // Incomplete
  'MATHS TUITION': 'Mathematics', // Marketing label but refers to Math
  'IGCSE High School Mathematics': 'Mathematics',
};

/**
 * Normalize a subject name to its canonical form
 * @param {string} rawSubject - Raw subject name from dataset
 * @returns {string|null} - Canonical subject name or null if not a valid subject
 */
function normalizeSubject(rawSubject) {
  if (!rawSubject) return null;
  
  const trimmed = rawSubject.trim();
  
  // Check if we have an explicit mapping
  if (trimmed in CANONICAL_SUBJECTS) {
    return CANONICAL_SUBJECTS[trimmed];
  }
  
  // If not in map, it's likely a typo or new entry - log warning
  console.warn(`⚠️  Unmapped subject: "${trimmed}"`);
  return null;
}

/**
 * Get all unique canonical subjects
 */
function getCanonicalSubjects() {
  const subjects = new Set();
  Object.values(CANONICAL_SUBJECTS).forEach(subject => {
    if (subject !== null) {
      subjects.add(subject);
    }
  });
  return Array.from(subjects).sort();
}

module.exports = {
  normalizeSubject,
  getCanonicalSubjects,
  CANONICAL_SUBJECTS
};
