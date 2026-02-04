#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkState() {
  try {
    const centres = await prisma.tuitionCentre.count();
    const offerings = await prisma.offering.count();
    const levels = await prisma.level.count();
    const subjects = await prisma.subject.count();
    
    console.log('Current DB State:');
    console.log(`  Centres: ${centres}`);
    console.log(`  Offerings: ${offerings}`);
    console.log(`  Levels: ${levels}`);
    console.log(`  Subjects: ${subjects}`);
    
    if (centres > 0) {
      const sample = await prisma.tuitionCentre.findFirst({
        select: { name: true, dataQualityNotes: true, createdAt: true }
      });
      console.log('\nSample centre:');
      console.log(`  Name: ${sample.name}`);
      console.log(`  Created: ${sample.createdAt}`);
      console.log(`  Notes: ${sample.dataQualityNotes}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkState();
