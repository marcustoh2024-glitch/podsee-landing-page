/**
 * Add levels and subjects to centres.json based on centre names
 */

import { readFileSync, writeFileSync } from 'fs'

const centresData = JSON.parse(readFileSync('./src/data/centres.json', 'utf-8'))

// Helper to infer subjects from centre name
function inferSubjects(name) {
  const subjects = []
  const nameLower = name.toLowerCase()
  
  if (nameLower.includes('math')) subjects.push('Math')
  if (nameLower.includes('english')) subjects.push('English')
  if (nameLower.includes('chinese')) subjects.push('Chinese')
  if (nameLower.includes('science')) subjects.push('Science')
  if (nameLower.includes('econs') || nameLower.includes('economics')) subjects.push('Economics')
  if (nameLower.includes('humanities')) subjects.push('Humanities')
  
  // Default: if no specific subject, assume general tuition
  if (subjects.length === 0) {
    subjects.push('Math', 'English', 'Science')
  }
  
  return subjects
}

// Helper to infer levels from centre name (default to all)
function inferLevels(name) {
  // Most centres serve multiple levels, so default to all
  return ['Primary', 'Secondary', 'JC']
}

// Add levels and subjects to each centre
const updatedCentres = centresData.map(centre => ({
  ...centre,
  levels: inferLevels(centre.name),
  subjects: inferSubjects(centre.name)
}))

// Write back to file
writeFileSync('./src/data/centres.json', JSON.stringify(updatedCentres, null, 2))

console.log(`✅ Updated ${updatedCentres.length} centres with levels and subjects`)

// Show some examples
console.log('\n--- Examples ---')
updatedCentres.slice(0, 5).forEach(c => {
  console.log(`\n${c.name}`)
  console.log(`  Levels: ${c.levels.join(', ')}`)
  console.log(`  Subjects: ${c.subjects.join(', ')}`)
})
