/**
 * Utility functions for working with tuition centre data
 */

/**
 * Normalize a WhatsApp number into a wa.me link
 * @param {string|null} whatsappNumber - Phone number (e.g., "+6598752843" or "6598118333")
 * @returns {string|null} - WhatsApp link (e.g., "https://wa.me/6598752843") or null
 */
export function normalizeWhatsAppLink(whatsappNumber) {
  if (!whatsappNumber) return null
  
  // Remove all non-digit characters except leading +
  let cleaned = whatsappNumber.replace(/[^\d+]/g, '')
  
  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }
  
  // Ensure it starts with country code (65 for Singapore)
  if (!cleaned.startsWith('65')) {
    cleaned = '65' + cleaned
  }
  
  return `https://wa.me/${cleaned}`
}

/**
 * Get the clean centre name without branch suffix
 * @param {string} fullName - Full centre name (e.g., "AM Academy (Main)")
 * @returns {string} - Clean name (e.g., "AM Academy")
 */
export function getCentreName(fullName) {
  const match = fullName.match(/^(.+?)\s*\([^)]+\)$/)
  return match ? match[1].trim() : fullName
}

/**
 * Get the branch name from full centre name
 * @param {string} fullName - Full centre name (e.g., "AM Academy (Main)")
 * @returns {string|null} - Branch name (e.g., "Main") or null
 */
export function getBranchName(fullName) {
  const match = fullName.match(/\(([^)]+)\)$/)
  return match ? match[1] : null
}
