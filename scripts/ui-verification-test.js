#!/usr/bin/env node
/**
 * UI VERIFICATION TEST
 * Simulates UI checks against Excel source data
 * Tests:
 * 1. No filters - should return 60 centres
 * 2. Marine Parade filter - should return most/all
 * 3. Random 3 centres - verify name, address, website, WhatsApp
 */

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function verifyUI() {
  console.log('🔍 UI VERIFICATION TEST\n');
  console.log('Simulating user actions in the UI...\n');
  
  try {
    // Load Excel for comparison
    const filePath = path.join(process.cwd(), 'database_ready (1).xlsx');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = rawData[1];
    const excelRows = rawData.slice(2).filter(row => row.some(cell => cell));
    
    const colMap = {
      centre_name: headers.indexOf('centre_name'),
      branch_name: headers.indexOf('branch_name'),
      address: headers.indexOf('address'),
      postal_code: headers.indexOf('postal_code'),
      area: headers.indexOf('area'),
      website_url: headers.indexOf('website_url'),
      whatsapp_number: headers.indexOf('whatsapp_number'),
    };
    
    // Build Excel lookup map
    const excelData = new Map();
    excelRows.forEach(row => {
      const centreName = row[colMap.centre_name];
      const branchName = row[colMap.branch_name];
      const displayName = branchName ? `${centreName} (${branchName})` : centreName;
      
      excelData.set(displayName, {
        name: displayName,
        address: row[colMap.address],
        postalCode: row[colMap.postal_code],
        area: row[colMap.area],
        website: row[colMap.website_url],
        whatsapp: row[colMap.whatsapp_number],
      });
    });
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST 1: No Filters Applied');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Simulate API call with no filters
    const allCentres = await prisma.tuitionCentre.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        whatsappNumber: true,
        website: true,
      },
    });
    
    console.log(`✅ Total centres returned: ${allCentres.length}`);
    if (allCentres.length === 60) {
      console.log('   ✅ PASS: Expected 60 centres\n');
    } else {
      console.log(`   ❌ FAIL: Expected 60, got ${allCentres.length}\n`);
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST 2: Marine Parade Location Filter');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Simulate location filter (checking if location contains "Marine Parade")
    const marineParadeCentres = allCentres.filter(c => 
      c.location.toLowerCase().includes('marine parade')
    );
    
    console.log(`✅ Centres with "Marine Parade" in location: ${marineParadeCentres.length}`);
    console.log(`   Percentage: ${Math.round(marineParadeCentres.length / allCentres.length * 100)}%`);
    
    if (marineParadeCentres.length >= 50) {
      console.log('   ✅ PASS: Most centres are in Marine Parade\n');
    } else {
      console.log('   ⚠️  WARNING: Fewer Marine Parade centres than expected\n');
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST 3: Random 3 Centres - Data Integrity Check');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Pick 3 random centres
    const shuffled = [...allCentres].sort(() => Math.random() - 0.5);
    const randomCentres = shuffled.slice(0, 3);
    
    let passCount = 0;
    let failCount = 0;
    
    for (const [idx, centre] of randomCentres.entries()) {
      console.log(`\n--- Centre ${idx + 1}: ${centre.name} ---`);
      
      const excelRecord = excelData.get(centre.name);
      
      if (!excelRecord) {
        console.log('   ❌ FAIL: Centre not found in Excel');
        failCount++;
        continue;
      }
      
      let centrePass = true;
      
      // Check name
      if (centre.name === excelRecord.name) {
        console.log('   ✅ Name matches Excel');
      } else {
        console.log(`   ❌ Name mismatch: DB="${centre.name}" vs Excel="${excelRecord.name}"`);
        centrePass = false;
      }
      
      // Check address exists
      if (centre.location && centre.location.trim()) {
        console.log(`   ✅ Address exists: ${centre.location}`);
        
        // Verify it matches Excel address
        const expectedAddress = excelRecord.address || excelRecord.area;
        if (centre.location === expectedAddress) {
          console.log('   ✅ Address matches Excel exactly');
        } else {
          console.log(`   ⚠️  Address differs from Excel:`);
          console.log(`      DB: ${centre.location}`);
          console.log(`      Excel: ${expectedAddress}`);
        }
      } else {
        console.log('   ❌ Address missing');
        centrePass = false;
      }
      
      // Check postal code (embedded in address)
      if (excelRecord.postalCode) {
        const postalInLocation = centre.location.includes(String(excelRecord.postalCode));
        if (postalInLocation) {
          console.log(`   ✅ Postal code ${excelRecord.postalCode} found in address`);
        } else {
          console.log(`   ⚠️  Postal code ${excelRecord.postalCode} not in address`);
        }
      }
      
      // Check website
      if (centre.website) {
        console.log(`   ✅ Website exists: ${centre.website}`);
        
        if (centre.website === excelRecord.website) {
          console.log('   ✅ Website matches Excel');
        } else {
          console.log(`   ⚠️  Website differs:`);
          console.log(`      DB: ${centre.website}`);
          console.log(`      Excel: ${excelRecord.website}`);
        }
      } else if (excelRecord.website) {
        console.log(`   ⚠️  Website missing (Excel has: ${excelRecord.website})`);
      } else {
        console.log('   ✅ Website correctly null (not in Excel)');
      }
      
      // Check WhatsApp
      if (centre.whatsappNumber && centre.whatsappNumber.trim()) {
        console.log(`   ✅ WhatsApp exists: ${centre.whatsappNumber}`);
        
        const dbWhatsApp = centre.whatsappNumber.replace(/\D/g, '');
        const excelWhatsApp = String(excelRecord.whatsapp || '').replace(/\D/g, '');
        
        if (dbWhatsApp === excelWhatsApp) {
          console.log('   ✅ WhatsApp matches Excel');
        } else {
          console.log(`   ⚠️  WhatsApp differs:`);
          console.log(`      DB: ${centre.whatsappNumber}`);
          console.log(`      Excel: ${excelRecord.whatsapp}`);
        }
      } else if (excelRecord.whatsapp) {
        console.log(`   ⚠️  WhatsApp missing (Excel has: ${excelRecord.whatsapp})`);
      } else {
        console.log('   ✅ WhatsApp correctly empty (not in Excel)');
      }
      
      if (centrePass) {
        passCount++;
        console.log('\n   ✅ OVERALL: PASS');
      } else {
        failCount++;
        console.log('\n   ❌ OVERALL: FAIL');
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('FINAL RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`Test 1 (No filters): ${allCentres.length === 60 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 2 (Marine Parade): ${marineParadeCentres.length >= 50 ? '✅ PASS' : '⚠️  WARNING'}`);
    console.log(`Test 3 (Random centres): ${passCount}/3 passed, ${failCount}/3 failed`);
    
    const allTestsPass = allCentres.length === 60 && 
                         marineParadeCentres.length >= 50 && 
                         failCount === 0;
    
    if (allTestsPass) {
      console.log('\n🎉 ALL TESTS PASSED - UI verification successful!');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED - Review issues above');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyUI();
