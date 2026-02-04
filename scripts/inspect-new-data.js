#!/usr/bin/env node
/**
 * Inspect database_ready (1).xlsx
 * Show: column headers + 5 sample rows
 * NO database writes
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
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    if (data.length === 0) {
      console.log('⚠️  File is empty or has no data rows');
      return;
    }
    
    // Show headers
    const headers = Object.keys(data[0]);
    console.log(`📋 Column Headers (${headers.length} columns):`);
    headers.forEach((header, idx) => {
      console.log(`  ${idx + 1}. "${header}"`);
    });
    
    console.log(`\n📊 Total rows in file: ${data.length}`);
    console.log(`\n🔍 First 5 sample rows:\n`);
    
    // Show first 5 rows
    const sampleRows = data.slice(0, 5);
    sampleRows.forEach((row, idx) => {
      console.log(`--- Row ${idx + 1} ---`);
      headers.forEach(header => {
        const value = row[header];
        const display = value === '' ? '(empty)' : value;
        console.log(`  ${header}: ${display}`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
    throw error;
  }
}

inspectExcel();
