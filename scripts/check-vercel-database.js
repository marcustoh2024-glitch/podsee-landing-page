#!/usr/bin/env node

/**
 * Check Vercel Database State
 * 
 * This script helps diagnose why filters work locally but not on Vercel.
 * It checks the offerings count which determines if filters are enabled.
 * 
 * Usage:
 *   # Check local database
 *   node scripts/check-vercel-database.js
 * 
 *   # Check Vercel database (after pulling env vars)
 *   vercel env pull .env.production
 *   DATABASE_URL="<from .env.production>" node scripts/check-vercel-database.js
 */

const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking Database State...\n');
    
    // Check database connection
    console.log('📊 Database URL:', process.env.DATABASE_URL?.split('@')[1] || 'Not set');
    console.log('');
    
    // Check offerings count (critical for filters)
    const offeringsCount = await prisma.offering.count();
    console.log('📦 Offerings Count:', offeringsCount);
    
    if (offeringsCount === 0) {
      console.log('❌ PROBLEM FOUND: No offerings in database');
      console.log('   This is why filters are disabled on Vercel!');
      console.log('');
      console.log('💡 Solution:');
      console.log('   1. Set up Postgres database on Vercel');
      console.log('   2. Run migrations: npx prisma migrate deploy');
      console.log('   3. Import data: node scripts/ingest-all-centres.js');
      console.log('');
    } else {
      console.log('✅ Offerings exist - filters should work');
      console.log('');
    }
    
    // Check tuition centres
    const centresCount = await prisma.tuitionCentre.count();
    console.log('🏫 Tuition Centres:', centresCount);
    
    // Check levels and subjects
    const levelsCount = await prisma.level.count();
    const subjectsCount = await prisma.subject.count();
    console.log('📚 Levels:', levelsCount);
    console.log('📖 Subjects:', subjectsCount);
    console.log('');
    
    // Sample offerings
    if (offeringsCount > 0) {
      const sampleOfferings = await prisma.offering.findMany({
        take: 5,
        include: {
          tuitionCentre: { select: { name: true } },
          level: { select: { name: true } },
          subject: { select: { name: true } }
        }
      });
      
      console.log('📋 Sample Offerings:');
      sampleOfferings.forEach((o, i) => {
        console.log(`   ${i + 1}. ${o.tuitionCentre.name} - ${o.level.name} ${o.subject.name}`);
      });
      console.log('');
    }
    
    // Check filter API response
    console.log('🔧 Filter API Status:');
    if (offeringsCount === 0) {
      console.log('   enabled: false');
      console.log('   reason: "No offerings data yet"');
    } else {
      console.log('   enabled: true');
      console.log('   levels: Available');
      console.log('   subjects: Available');
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.log('');
    console.log('💡 Possible causes:');
    console.log('   - DATABASE_URL not set or invalid');
    console.log('   - Database not accessible');
    console.log('   - Migrations not run');
    console.log('');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
