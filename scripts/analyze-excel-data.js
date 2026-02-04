/**
 * Script to analyze the Excel dataset structure
 * This will help us understand the data format before importing
 */

const XLSX = require('xlsx');
const path = require('path');

async function analyzeExcelData() {
  try {
    // Read the Excel file
    const filePath = path.join(process.cwd(), 'Offerings_MarineParade_Encoded.xlsx');
    const workbook = XLSX.readFile(filePath);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('=== EXCEL DATA ANALYSIS ===\n');
    console.log(`Total rows: ${data.length}\n`);
    
    if (data.length > 0) {
      console.log('=== COLUMN HEADERS ===');
      const headers = Object.keys(data[0]);
      headers.forEach((header, index) => {
        console.log(`${index + 1}. ${header}`);
      });
      
      console.log('\n=== FIRST 3 ROWS (SAMPLE DATA) ===\n');
      data.slice(0, 3).forEach((row, index) => {
        console.log(`--- Row ${index + 1} ---`);
        Object.entries(row).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        console.log('');
      });
      
      console.log('=== DATA TYPE ANALYSIS ===');
      headers.forEach(header => {
        const sampleValues = data.slice(0, 5).map(row => row[header]).filter(v => v !== undefined && v !== null && v !== '');
        console.log(`\n${header}:`);
        console.log(`  Sample values: ${sampleValues.join(' | ')}`);
      });
    }
    
  } catch (error) {
    console.error('Error analyzing Excel file:', error.message);
    process.exit(1);
  }
}

analyzeExcelData();
