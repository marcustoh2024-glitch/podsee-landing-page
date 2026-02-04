#!/usr/bin/env node
/**
 * Inspect database_ready (1).xlsx with proper header handling
 * Row 1 = headers, data starts Row 2
 */

const XLSX = require('xlsx');
const path = require('path');

function inspectExcel() {
  const filePath = path.join(process.cwd(), 'database_ready (1).xlsx');
  
  console.log('📊 Inspecting: database_ready (1).xlsx\n');
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`Sheet name: "${sheetName}"\n`);
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Read with header row (range starts at A2 to skip row 1 as data)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length < 2) {
      console.log('⚠️  File has no data rows (only headers or empty)');
      return;
    }
    
    // Row 1 = headers, Row 2+ = data
    const headers = rawData[0]; // Keep all columns including empty
    const dataRows = rawData.slice(1).filter(row => row.some(cell => cell)); // Remove empty rows
    
    // Find non-empty header indices
    const nonEmptyHeaders = [];
    const nonEmptyIndices = [];
    headers.forEach((h, idx) => {
      if (h && h.trim()) {
        nonEmptyHeaders.push(h);
        nonEmptyIndices.push(idx);
      }
    });
    
    console.log(`📋 Column Headers (${nonEmptyHeaders.length} non-empty columns):`);
    nonEmptyHeaders.forEach((header, idx) => {
      console.log(`  ${idx + 1}. "${header}"`);
    });
    
    console.log(`\n📊 Total data rows: ${dataRows.length}`);
    console.log(`\n🔍 First 5 sample rows:\n`);
    
    // Show first 5 data rows
    const sampleRows = dataRows.slice(0, 5);
    sampleRows.forEach((row, idx) => {
      console.log(`--- Row ${idx + 1} ---`);
      nonEmptyHeaders.forEach((header, headerIdx) => {
        const colIdx = nonEmptyIndices[headerIdx];
        const value = row[colIdx];
        const display = (value === undefined || value === '') ? '(empty)' : value;
        console.log(`  ${header}: ${display}`);
      });
      console.log('');
    });
    
    // Show distinct areas
    const areas = new Set();
    const areaColIdx = nonEmptyIndices[nonEmptyHeaders.indexOf('area')];
    dataRows.forEach(row => {
      if (areaColIdx >= 0 && row[areaColIdx]) {
        areas.add(row[areaColIdx]);
      }
    });
    
    console.log(`\n📍 Distinct areas found: ${areas.size}`);
    Array.from(areas).sort().forEach(area => console.log(`  - ${area}`));
    
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
    throw error;
  }
}

inspectExcel();
