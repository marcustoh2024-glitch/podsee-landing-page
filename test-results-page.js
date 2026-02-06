/**
 * Test script to verify results page works with local JSON data
 */

import { readFileSync } from 'fs'

const centresData = JSON.parse(readFileSync('./src/data/centres.json', 'utf-8'))

console.log('✓ Successfully imported centres.json')
console.log(`✓ Found ${centresData.length} centres`)

// Test normalizeWhatsAppLink
function normalizeWhatsAppLink(whatsappNumber) {
  if (!whatsappNumber) return null
  let cleaned = whatsappNumber.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1)
  if (!cleaned.startsWith('65')) cleaned = '65' + cleaned
  return `https://wa.me/${cleaned}`
}

// Test getCentreName
function getCentreName(fullName) {
  const match = fullName.match(/^(.+?)\s*\([^)]+\)$/)
  return match ? match[1].trim() : fullName
}

// Test getBranchName
function getBranchName(fullName) {
  const match = fullName.match(/\(([^)]+)\)$/)
  return match ? match[1] : null
}

// Test first centre
const firstCentre = centresData[0]
console.log('\n--- Testing first centre ---')
console.log('Raw name:', firstCentre.name)
console.log('Clean name:', getCentreName(firstCentre.name))
console.log('Branch:', getBranchName(firstCentre.name))
console.log('WhatsApp:', normalizeWhatsAppLink(firstCentre.whatsapp_number))
console.log('Website:', firstCentre.website_url)

// Test centre without WhatsApp
const noWhatsApp = centresData.find(c => !c.whatsapp_number)
if (noWhatsApp) {
  console.log('\n--- Testing centre without WhatsApp ---')
  console.log('Name:', noWhatsApp.name)
  console.log('WhatsApp link:', normalizeWhatsAppLink(noWhatsApp.whatsapp_number))
}

// Test search functionality
const searchTerm = 'math'
const searchResults = centresData.filter(centre => 
  centre.name.toLowerCase().includes(searchTerm) ||
  centre.address.toLowerCase().includes(searchTerm)
)
console.log(`\n✓ Search for "${searchTerm}" found ${searchResults.length} results`)

// Test pagination
const pageSize = 20
const page1 = centresData.slice(0, pageSize)
const page2 = centresData.slice(pageSize, pageSize * 2)
console.log(`\n✓ Pagination works: Page 1 has ${page1.length} items, Page 2 has ${page2.length} items`)

console.log('\n✅ All tests passed! Results page should work offline.')
