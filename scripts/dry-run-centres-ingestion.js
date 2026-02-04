#!/usr/bin/env node
/**
 * DRY RUN: Analyze database_ready (1).xlsx for centres ingestion
 * Reports: total rows, unique centres, distinct locations, invalid rows
 * NO database writes
 */

const XLSX = require('xlsx');
const path = require('path');

function dryRun() {
  const filePath = path.join(process.cwd(), 'database_ready (1).xlsx');
  
  console.log('🔍 DRY RUN: Analyzing database_ready (1).xlsx\n');
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read as array of arrays (Row 0 = empty, Row 1 = headers, Row 2+ = data)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length < 3) {
      console.log('⚠️  File has insufficient rows');
      return;
    }
    
    const headers = rawData[1]; // Row 1 = headers
    const dataRows = rawData.slice(2).filter(row => row.some(cell => cell)); // Row 2+ = data
    
    console.log(`📋 Headers: ${headers.filter(h => h).join(', ')}\n`);
    console.log(`📊 Total data rows: ${dataRows.length}\n`);
    
    // Map column indices
    const colMap = {
      centre_name: headers.indexOf('centre_name'),
      branch_name: headers.indexOf('branch_name'),
      address: headers.indexOf('address'),
      postal_code: headers.indexOf('postal_code'),
      area: headers.indexOf('area'),
      website_url: headers.indexOf('website_url'),
      whatsapp_number: headers.indexOf('whatsapp_number'),
      source_url: headers.indexOf('source_url'),
      verification_status: headers.indexOf('verification_status'),
      notes: headers.indexOf('notes'),
    };
    
    // Validate and analyze
    const centres = new Set();
    const areas = new Set();
    const invalidRows = [];
    const validRows = [];
    
    dataRows.forEach((row, idx) => {
      const rowNum = idx + 3; // Excel row number (0=empty, 1=header, 2=first data)
      
      const centreName = row[colMap.centre_name];
      const branchName = row[colMap.branch_name];
      const area = row[colMap.area];
      const whatsapp = row[colMap.whatsapp_number];
      
      // Validation: must have centre name and area
      if (!centreName || !area) {
        invalidRows.push({
          rowNum,
          reason: `Missing ${!centreName ? 'centre_name' : 'area'}`,
          data: { centreName, branchName, area }
        });
        return;
      }
      
      // Build unique centre identifier (name + branch)
      const centreId = branchName ? `${centreName} (${branchName})` : centreName;
      centres.add(centreId);
      areas.add(area);
      
      validRows.push({
        rowNum,
        centreName,
        branchName,
        area,
        whatsapp,
        address: row[colMap.address],
        website: row[colMap.website_url],
      });
    });
    
    // Report
    console.log('✅ VALID ROWS');
    console.log(`   Total: ${validRows.length}`);
    console.log(`   Unique centres: ${centres.size}`);
    console.log(`   Distinct areas: ${areas.size}\n`);
    
    console.log('📍 Areas:');
    Array.from(areas).sort().forEach(area => console.log(`   - ${area}`));
    
    if (invalidRows.length > 0) {
      console.log(`\n⚠️  INVALID ROWS: ${invalidRows.length}`);
      invalidRows.forEach(({ rowNum, reason, data }) => {
        console.log(`   Row ${rowNum}: ${reason}`);
        console.log(`      ${JSON.stringify(data)}`);
      });
    } else {
      console.log('\n✅ No invalid rows detected');
    }
    
    console.log('\n📋 Sample valid centres (first 5):');
    validRows.slice(0, 5).forEach(({ centreName, branchName, area, whatsapp }) => {
      const display = branchName ? `${centreName} (${branchName})` : centreName;
      console.log(`   - ${display}`);
      console.log(`     Area: ${area}, WhatsApp: ${whatsapp || '(none)'}`);
    });
    
    console.log('\n✅ DRY RUN COMPLETE');
    console.log(`   Ready to ingest: ${validRows.length} centres`);
    console.log(`   Will skip: ${invalidRows.length} invalid rows`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

dryRun();
