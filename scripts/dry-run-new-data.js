#!/usr/bin/env node

/**
 * Step D: Dry-run ingestion of database_ready (1).xlsx
 * Report what WOULD be imported (no DB writes)
 */

const XLSX = require('xlsx');

function dryRun() {
  console.log('🔍 STEP D: Dry-run ingestion analysis\n');

  try {
    const workbook = XLSX.readFile('database_ready (1).xlsx');
    
    // Parse centres
    const centresSheet = workbook.Sheets['centres'];
    const centresData = XLSX.utils.sheet_to_json(centresSheet, { range: 1 });
    
    // Parse offerings
    const offeringsSheet = workbook.Sheets['offerings'];
    const offeringsData = XLSX.utils.sheet_to_json(offeringsSheet, { range: 1 });
    
    console.log('='.repeat(70));
    console.log('IMPORT PLAN');
    console.log('='.repeat(70));
    
    // Centres analysis
    console.log('\n📍 CENTRES:');
    console.log(`  Total rows: ${centresData.length}`);
    
    const centresByArea = {};
    centresData.forEach(c => {
      const area = c.area || 'Unknown';
      centresByArea[area] = (centresByArea[area] || 0) + 1;
    });
    
    console.log('  By area:');
    Object.entries(centresByArea).sort().forEach(([area, count]) => {
      console.log(`    ${area}: ${count}`);
    });
    
    // Check for duplicates
    const centreNames = centresData.map(c => `${c.centre_name}|${c.branch_name}`);
    const duplicateCentres = centreNames.filter((name, idx) => centreNames.indexOf(name) !== idx);
    
    if (duplicateCentres.length > 0) {
      console.log(`  ⚠️  Duplicate centres found: ${duplicateCentres.length}`);
      console.log(`     ${[...new Set(duplicateCentres)].join(', ')}`);
    } else {
      console.log('  ✓ No duplicate centres');
    }
    
    // Offerings analysis
    console.log('\n📚 OFFERINGS:');
    console.log(`  Total rows: ${offeringsData.length}`);
    
    const uniqueLevels = [...new Set(offeringsData.map(r => r.level).filter(Boolean))];
    const uniqueSubjects = [...new Set(offeringsData.map(r => r.subject).filter(Boolean))];
    const uniqueCentresInOfferings = [...new Set(offeringsData.map(r => r.centre_name).filter(Boolean))];
    
    console.log(`  Unique levels: ${uniqueLevels.length}`);
    console.log(`  Unique subjects: ${uniqueSubjects.length}`);
    console.log(`  Centres with offerings: ${uniqueCentresInOfferings.length}`);
    
    // Check for centres without offerings
    const centreNamesSet = new Set(centresData.map(c => c.centre_name));
    const offeringCentresSet = new Set(uniqueCentresInOfferings);
    const centresWithoutOfferings = [...centreNamesSet].filter(name => !offeringCentresSet.has(name));
    
    if (centresWithoutOfferings.length > 0) {
      console.log(`\n  ⚠️  Centres without offerings: ${centresWithoutOfferings.length}`);
      centresWithoutOfferings.forEach(name => console.log(`     - ${name}`));
    } else {
      console.log('  ✓ All centres have offerings');
    }
    
    // Check for offerings without matching centres
    const offeringsWithoutCentre = offeringsData.filter(o => !centreNamesSet.has(o.centre_name));
    
    if (offeringsWithoutCentre.length > 0) {
      console.log(`\n  ⚠️  Offerings without matching centre: ${offeringsWithoutCentre.length}`);
      const uniqueMissing = [...new Set(offeringsWithoutCentre.map(o => o.centre_name))];
      uniqueMissing.forEach(name => console.log(`     - ${name}`));
    } else {
      console.log('  ✓ All offerings have matching centres');
    }
    
    // Offerings by level
    console.log('\n  Offerings by level:');
    const offeringsByLevel = {};
    offeringsData.forEach(o => {
      const level = o.level || 'Unknown';
      offeringsByLevel[level] = (offeringsByLevel[level] || 0) + 1;
    });
    Object.entries(offeringsByLevel).sort().forEach(([level, count]) => {
      console.log(`    ${level}: ${count}`);
    });
    
    // Offerings by subject
    console.log('\n  Offerings by subject:');
    const offeringsBySubject = {};
    offeringsData.forEach(o => {
      const subject = o.subject || 'Unknown';
      offeringsBySubject[subject] = (offeringsBySubject[subject] || 0) + 1;
    });
    Object.entries(offeringsBySubject).sort().forEach(([subject, count]) => {
      console.log(`    ${subject}: ${count}`);
    });
    
    // Data quality checks
    console.log('\n🔍 DATA QUALITY:');
    
    const centresWithMissingData = centresData.filter(c => 
      !c.centre_name || !c.area || !c.whatsapp_number
    );
    
    if (centresWithMissingData.length > 0) {
      console.log(`  ⚠️  Centres with missing required fields: ${centresWithMissingData.length}`);
    } else {
      console.log('  ✓ All centres have required fields');
    }
    
    const offeringsWithMissingData = offeringsData.filter(o => 
      !o.centre_name || !o.level || !o.subject
    );
    
    if (offeringsWithMissingData.length > 0) {
      console.log(`  ⚠️  Offerings with missing required fields: ${offeringsWithMissingData.length}`);
    } else {
      console.log('  ✓ All offerings have required fields');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(70));
    console.log(`Will create:`);
    console.log(`  - ${centresData.length} tuition centres`);
    console.log(`  - ${uniqueLevels.length} levels`);
    console.log(`  - ${uniqueSubjects.length} subjects`);
    console.log(`  - ${offeringsData.length} offerings (level-subject combinations)`);
    console.log(`\nAll centres will be tagged with: sourceDataset = "database_ready_v1"`);
    
    console.log('\n✅ STEP D COMPLETE: Dry-run analysis finished');
    console.log('   Ready to proceed with actual import\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dryRun();
