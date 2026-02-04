const XLSX = require('xlsx');
const wb = XLSX.readFile('database_ready (1).xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets['centres'], { range: 1 });
const missing = data.filter(c => !c.centre_name || !c.area || !c.whatsapp_number);
console.log('Centres with missing data:', missing.length);
missing.forEach(c => {
  console.log('\nCentre:', c.centre_name || '(missing)');
  console.log('Area:', c.area || '(missing)');
  console.log('WhatsApp:', c.whatsapp_number || '(missing)');
  console.log('Address:', c.address || '(missing)');
});
