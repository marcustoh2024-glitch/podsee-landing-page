/**
 * Test client-side filtering logic
 */

import { readFileSync } from 'fs'

const centresData = JSON.parse(readFileSync('./src/data/centres.json', 'utf-8'))

console.log(`Total centres: ${centresData.length}\n`)

// Test 1: Filter by single level (Primary)
console.log('=== Test 1: Level = Primary ===')
const selectedLevels1 = ['Primary']
const result1 = centresData.filter(centre =>
  centre.levels?.some(level => selectedLevels1.includes(level))
)
console.log(`Found ${result1.length} centres`)
console.log('Examples:', result1.slice(0, 3).map(c => c.name))

// Test 2: Filter by single subject (Math)
console.log('\n=== Test 2: Subject = Math ===')
const selectedSubjects2 = ['Math']
const result2 = centresData.filter(centre =>
  centre.subjects?.some(subject => selectedSubjects2.includes(subject))
)
console.log(`Found ${result2.length} centres`)
console.log('Examples:', result2.slice(0, 3).map(c => c.name))

// Test 3: Filter by level AND subject (Primary AND Math)
console.log('\n=== Test 3: Level = Primary AND Subject = Math ===')
const selectedLevels3 = ['Primary']
const selectedSubjects3 = ['Math']
const result3 = centresData.filter(centre =>
  centre.levels?.some(level => selectedLevels3.includes(level)) &&
  centre.subjects?.some(subject => selectedSubjects3.includes(subject))
)
console.log(`Found ${result3.length} centres`)
console.log('Examples:', result3.slice(0, 3).map(c => c.name))

// Test 4: Multi-select levels (Primary OR Secondary)
console.log('\n=== Test 4: Level = Primary OR Secondary ===')
const selectedLevels4 = ['Primary', 'Secondary']
const result4 = centresData.filter(centre =>
  centre.levels?.some(level => selectedLevels4.includes(level))
)
console.log(`Found ${result4.length} centres`)
console.log('Examples:', result4.slice(0, 3).map(c => c.name))

// Test 5: Multi-select subjects (Math OR English)
console.log('\n=== Test 5: Subject = Math OR English ===')
const selectedSubjects5 = ['Math', 'English']
const result5 = centresData.filter(centre =>
  centre.subjects?.some(subject => selectedSubjects5.includes(subject))
)
console.log(`Found ${result5.length} centres`)
console.log('Examples:', result5.slice(0, 3).map(c => c.name))

// Test 6: Complex filter (Primary OR Secondary) AND (Math OR Science)
console.log('\n=== Test 6: (Primary OR Secondary) AND (Math OR Science) ===')
const selectedLevels6 = ['Primary', 'Secondary']
const selectedSubjects6 = ['Math', 'Science']
const result6 = centresData.filter(centre =>
  centre.levels?.some(level => selectedLevels6.includes(level)) &&
  centre.subjects?.some(subject => selectedSubjects6.includes(subject))
)
console.log(`Found ${result6.length} centres`)
console.log('Examples:', result6.slice(0, 3).map(c => c.name))

// Test 7: Specific subject only (Economics)
console.log('\n=== Test 7: Subject = Economics ===')
const selectedSubjects7 = ['Economics']
const result7 = centresData.filter(centre =>
  centre.subjects?.some(subject => selectedSubjects7.includes(subject))
)
console.log(`Found ${result7.length} centres`)
console.log('All results:', result7.map(c => c.name))

console.log('\n✅ All filter tests completed!')
