/**
 * Verify API Database Connection
 * 
 * This script runs in the same environment as the API to prove:
 * 1. Which database is being queried
 * 2. What data exists in that database
 * 3. Sample records that should appear in search results
 */

// Use the SAME prisma instance as the API
import { prisma } from '../src/lib/prisma.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function verifyDatabase() {
  console.log('═'.repeat(80));
  console.log('API DATABASE VERIFICATION');
  console.log('═'.repeat(80));
  console.log('\n');
  
  try {
    // ========================================================================
    // STEP 1: Identify the database being used
    // ========================================================================
    console.log('📍 STEP 1: DATABASE IDENTIFICATION\n');
    console.log('─'.repeat(80));
    
    // Get DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    console.log(`DATABASE_URL: ${databaseUrl}`);
    
    // Determine database type
    let dbType = 'Unknown';
    let dbPath = null;
    let dbHost = null;
    let dbName = null;
    
    if (databaseUrl.startsWith('file:')) {
      dbType = 'SQLite';
      dbPath = databaseUrl.replace('file:', '');
      
      // Resolve relative path
      const prismaDir = resolve(__dirname, '../prisma');
      const fullPath = resolve(prismaDir, dbPath);
      
      console.log(`Database Type: ${dbType}`);
      console.log(`Database File: ${dbPath}`);
      console.log(`Full Path: ${fullPath}`);
      console.log(`File Exists: ${fs.existsSync(fullPath) ? '✅ YES' : '❌ NO'}`);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`Last Modified: ${stats.mtime.toISOString()}`);
      }
    } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      dbType = 'PostgreSQL';
      const url = new URL(databaseUrl);
      dbHost = url.hostname;
      dbName = url.pathname.substring(1).split('?')[0];
      
      console.log(`Database Type: ${dbType}`);
      console.log(`Host: ${dbHost}`);
      console.log(`Database Name: ${dbName}`);
    }
    
    console.log('\n');
    
    // ========================================================================
    // STEP 2: Test database connection
    // ========================================================================
    console.log('🔌 STEP 2: CONNECTION TEST\n');
    console.log('─'.repeat(80));
    
    try {
      await prisma.$connect();
      console.log('✅ Successfully connected to database');
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database is responsive');
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      throw error;
    }
    
    console.log('\n');
    
    // ========================================================================
    // STEP 3: Count total centres
    // ========================================================================
    console.log('📊 STEP 3: TOTAL CENTRES COUNT\n');
    console.log('─'.repeat(80));
    
    const totalCentres = await prisma.tuitionCentre.count();
    console.log(`Total Centres: ${totalCentres}`);
    
    const okCentres = await prisma.tuitionCentre.count({
      where: { dataQualityStatus: 'OK' }
    });
    
    const needsReviewCentres = await prisma.tuitionCentre.count({
      where: { dataQualityStatus: 'NEEDS_REVIEW' }
    });
    
    console.log(`  - OK Status: ${okCentres}`);
    console.log(`  - NEEDS_REVIEW Status: ${needsReviewCentres}`);
    
    console.log('\n');
    
    // ========================================================================
    // STEP 4: Count distinct locations
    // ========================================================================
    console.log('📍 STEP 4: DISTINCT LOCATIONS COUNT\n');
    console.log('─'.repeat(80));
    
    const locations = await prisma.tuitionCentre.findMany({
      select: { location: true },
      distinct: ['location']
    });
    
    console.log(`Distinct Locations: ${locations.length}`);
    
    for (const loc of locations) {
      const count = await prisma.tuitionCentre.count({
        where: { location: loc.location }
      });
      console.log(`  - ${loc.location}: ${count} centres`);
    }
    
    console.log('\n');
    
    // ========================================================================
    // STEP 5: Sample 5 centre records
    // ========================================================================
    console.log('📋 STEP 5: SAMPLE 5 CENTRE RECORDS\n');
    console.log('─'.repeat(80));
    
    const sampleCentres = await prisma.tuitionCentre.findMany({
      take: 5,
      include: {
        subjects: {
          include: { subject: true },
          take: 1
        },
        levels: {
          include: { level: true },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${sampleCentres.length} sample centres:\n`);
    
    sampleCentres.forEach((centre, index) => {
      console.log(`${index + 1}. ${centre.name}`);
      console.log(`   ID: ${centre.id}`);
      console.log(`   Location: ${centre.location}`);
      console.log(`   Quality Status: ${centre.dataQualityStatus}`);
      console.log(`   Website: ${centre.website || 'N/A'}`);
      
      if (centre.subjects.length > 0) {
        console.log(`   Sample Subject: ${centre.subjects[0].subject.name}`);
      } else {
        console.log(`   Sample Subject: (none)`);
      }
      
      if (centre.levels.length > 0) {
        console.log(`   Sample Level: ${centre.levels[0].level.name}`);
      } else {
        console.log(`   Sample Level: (none)`);
      }
      
      console.log('');
    });
    
    // ========================================================================
    // STEP 6: Count subjects and levels
    // ========================================================================
    console.log('📚 STEP 6: SUBJECTS AND LEVELS\n');
    console.log('─'.repeat(80));
    
    const totalSubjects = await prisma.subject.count();
    const totalLevels = await prisma.level.count();
    
    console.log(`Total Subjects: ${totalSubjects}`);
    console.log(`Total Levels: ${totalLevels}`);
    
    console.log('\n');
    
    // ========================================================================
    // STEP 7: Test the same query the API would use
    // ========================================================================
    console.log('🔍 STEP 7: SIMULATE API QUERY (No Filters)\n');
    console.log('─'.repeat(80));
    
    // This is the same query the API uses for an empty search
    const apiResults = await prisma.tuitionCentre.findMany({
      take: 20,
      skip: 0,
      include: {
        subjects: {
          include: { subject: true }
        },
        levels: {
          include: { level: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`API Query Results: ${apiResults.length} centres`);
    console.log('\nFirst 3 results:');
    
    apiResults.slice(0, 3).forEach((centre, index) => {
      console.log(`\n${index + 1}. ${centre.name}`);
      console.log(`   Location: ${centre.location}`);
      console.log(`   Subjects: ${centre.subjects.length}`);
      console.log(`   Levels: ${centre.levels.length}`);
      console.log(`   Quality: ${centre.dataQualityStatus}`);
    });
    
    console.log('\n');
    
    // ========================================================================
    // STEP 8: Test with Marine Parade filter
    // ========================================================================
    console.log('🔍 STEP 8: SIMULATE API QUERY (Marine Parade Location)\n');
    console.log('─'.repeat(80));
    
    const marineParadeResults = await prisma.tuitionCentre.findMany({
      where: {
        location: {
          contains: 'Marine Parade',
          mode: 'insensitive'
        }
      },
      take: 20,
      include: {
        subjects: {
          include: { subject: true }
        },
        levels: {
          include: { level: true }
        }
      }
    });
    
    console.log(`Marine Parade Results: ${marineParadeResults.length} centres`);
    
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═'.repeat(80));
    console.log('\n');
    
    console.log('SUMMARY:');
    console.log(`  Database Type: ${dbType}`);
    console.log(`  Database Path: ${dbPath || dbHost + '/' + dbName}`);
    console.log(`  Total Centres: ${totalCentres}`);
    console.log(`  Distinct Locations: ${locations.length}`);
    console.log(`  API Query Returns: ${apiResults.length} centres`);
    console.log(`  Marine Parade Centres: ${marineParadeResults.length}`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
