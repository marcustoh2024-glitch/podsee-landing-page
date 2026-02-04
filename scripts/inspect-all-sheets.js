#!/usr/bin/env node

const XLSX = require('xlsx');

function inspectAllSheets() {
  console.log('📊 Inspecting all sheets in: database_ready (1).xlsx\n');

  try {
    const workbook = XLSX.readFile('database_ready (1).xlsx');
    
    console.log(`Total sheets: ${workbook.SheetNames.length}\n`);
    
    workbook.SheetNames.forEach((sheetName, idx) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Sheet ${idx + 1}: "${sheetName}"`);
      console.log('='.repeat(60));
      
      const sheet = workbook.Sheets[sheetName];
      
      // Get range to understand sheet size
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const numRows = range.e.r - range.s.r + 1;
      const numCols = range.e.c - range.s.c + 1;
      
      console.log(`\nDimensions: ${numRows} rows × ${numCols} columns`);
      
      // Read as JSON with defval to handle empty cells
      const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      
      if (data.length === 0) {
        console.log('(no data rows)');
        return;
      }
      
      // Get headers from first data object
      const headers = Object.keys(data[0]);
      console.log(`\nHeaders (${headers.length} columns):`);
      headers.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));
      
      console.log(`\nData rows: ${data.length}`);
      
      // Show 3 sample data rows
      console.log(`\nSample data (first 3 rows):\n`);
      data.slice(0, 3).forEach((row, idx) => {
        console.log(`--- Row ${idx + 1} ---`);
        headers.forEach((header) => {
          const value = row[header];
          const display = value === undefined || value === null || value === '' 
            ? '(empty)' 
            : String(value).substring(0, 80);
          console.log(`  ${header}: ${display}`);
        });
        console.log('');
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspectAllSheets();
