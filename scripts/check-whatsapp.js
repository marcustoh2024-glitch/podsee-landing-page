const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const centres = await prisma.tuitionCentre.findMany({ 
    select: { name: true, whatsappNumber: true } 
  });
  
  const withWhatsApp = centres.filter(c => c.whatsappNumber && c.whatsappNumber.trim());
  const emptyWhatsApp = centres.filter(c => !c.whatsappNumber || !c.whatsappNumber.trim());
  
  console.log('WhatsApp number status:');
  console.log('  With WhatsApp: ' + withWhatsApp.length);
  console.log('  Without WhatsApp: ' + emptyWhatsApp.length);
  
  if (emptyWhatsApp.length > 0) {
    console.log('\nCentres without WhatsApp:');
    emptyWhatsApp.forEach(c => console.log('  - ' + c.name));
  }
  
  await prisma.$disconnect();
})();
