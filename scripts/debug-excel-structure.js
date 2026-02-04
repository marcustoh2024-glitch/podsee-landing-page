#!/usr/bin/env node
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'database_ready (1).xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('Raw data (first 3 rows):');
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log(JSON.stringify(rawData.slice(0, 3), null, 2));

console.log('\n\nWith defval (first 3 rows):');
const withDefval = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
console.log(JSON.stringify(withDefval.slice(0, 3), null, 2));
