#!/usr/bin/env node

/**
 * Step C: Inspect database_ready (1).xlsx structure
 * Parse with row 1 as headers, show actual data
 */

const XLSX = require('xlsx');

function inspectData() {
  console.log('📊 STEP C: Inspecting database_ready (1).xlsx\n');

  try {
    const workbook = XLSX.readFile('database_ready (1).xlsx');
    
    console.log(`Total sheets: ${workbook.SheetNames.length}\n`);
    
    // Sheet 1: Centres
    console.log('='.repeat(70));
    console.log('SHEET 1: CENTRES');
    console.log('='.repeat(70));
    
    const centresSheet = workbook.Sheets['centres'];
    const centresData = XLSX.utils.sheet_to_json(centresSheet, { range: 1 }); // Skip row 0, use row 1 as headers
    
    if (centresData.length > 0) {
      const centreHeaders = Object.keys(centresData[0]).filter(h => !h.startsWith('__EMPTY'));
      console.log(`\nHeaders: ${centreHeaders.join(', ')}`);
      console.log(`Total centres: ${centresData.length}`);
      
      console.log('\nSample centres (first 5):\n');
      centresData.slice(0, 5).forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.centre_name} (${row.branch_name})`);
        console.log(`   Area: ${row.area}`);
        console.log(`   Address: ${row.address}`);
        console.log(`   WhatsApp: ${row.whatsapp_number}`);
        console.log(`   Website: ${row.website_url || '(none)'}`);
        console.log('');
      });
    }
    
    // Sheet 2: Offerings
    console.log('='.repeat(70));
    console.log('SHEET 2: OFFERINGS');
    console.log('='.repeat(70));
    
    const offeringsSheet = workbook.Sheets['offerings'];
    const offeringsData = XLSX.utils.sheet_to_json(offeringsSheet, { range: 1 }); // Skip row 0, use row 1 as headers
    
    if (offeringsData.length > 0) {
      const offeringHeaders = Object.keys(offeringsData[0]).filter(h => !h.startsWith('__EMPTY'));
      console.log(`\nHeaders: ${offeringHeaders.join(', ')}`);
      console.log(`Total offerings: ${offeringsData.length}`);
      
      // Get unique values
      const uniqueLevels = [...new Set(offeringsData.map(r => r.level).filter(Boolean))];
      const uniqueSubjects = [...new Set(offeringsData.map(r => r.subject).filter(Boolean))];
      const uniqueCentres = [...new Set(offeringsData.map(r => r.centre_name).filter(Boolean))];
      const uniqueAreas = [...new Set(offeringsData.map(r => r.area).filter(Boolean))];
      
      console.log(`\nUnique centres: ${uniqueCentres.length}`);
      console.log(`Unique areas: ${uniqueAreas.length}`);
      console.log(`Unique levels: ${uniqueLevels.length}`);
      console.log(`Unique subjects: ${uniqueSubjects.length}`);
      
      console.log(`\nLevels: ${uniqueLevels.sort().join(', ')}`);
      console.log(`\nSubjects: ${uniqueSubjects.sort().join(', ')}`);
      console.log(`\nAreas: ${uniqueAreas.sort().join(', ')}`);
      
      console.log('\nSample offerings (first 10):\n');
      offeringsData.slice(0, 10).forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.centre_name} (${row.branch_name}) - ${row.level} ${row.subject}`);
      });
      
      // Check for invalid rows
      const invalidRows = offeringsData.filter(r => 
        !r.centre_name || !r.level || !r.subject
      );
      
      console.log(`\n\nData Quality:`);
      console.log(`  Valid offerings: ${offeringsData.length - invalidRows.length}`);
      console.log(`  Invalid/incomplete rows: ${invalidRows.length}`);
      
      if (invalidRows.length > 0 && invalidRows.length <= 10) {
        console.log('\nInvalid rows:');
        invalidRows.forEach((row, idx) => {
          console.log(`  ${idx + 1}. Centre: ${row.centre_name || '(missing)'}, Level: ${row.level || '(missing)'}, Subject: ${row.subject || '(missing)'}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ STEP C COMPLETE: Data structure inspected');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

inspectData();
