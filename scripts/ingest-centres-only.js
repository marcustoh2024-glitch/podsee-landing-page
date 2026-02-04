#!/usr/bin/env node
/**
 * REAL INGESTION: Import centres from database_ready (1).xlsx
 * - Centres only (no levels/subjects/offerings)
 * - Idempotent: skip duplicates based on name+location
 * - Tag with sourceDataset in dataQualityNotes
 */

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();
const SOURCE_TAG = 'sourceDataset=database_ready_v1';

async function ingestCentres() {
  console.log('📥 Starting centres ingestion from database_ready (1).xlsx\n');
  
  try {
    const filePath = path.join(process.cwd(), 'database_ready (1).xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read data (Row 0=empty, Row 1=headers, Row 2+=data)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = rawData[1];
    const dataRows = rawData.slice(2).filter(row => row.some(cell => cell));
    
    // Map columns
    const colMap = {
      centre_name: headers.indexOf('centre_name'),
      branch_name: headers.indexOf('branch_name'),
      address: headers.indexOf('address'),
      postal_code: headers.indexOf('postal_code'),
      area: headers.indexOf('area'),
      website_url: headers.indexOf('website_url'),
      whatsapp_number: headers.indexOf('whatsapp_number'),
      source_url: headers.indexOf('source_url'),
      verification_status: headers.indexOf('verification_status'),
      notes: headers.indexOf('notes'),
    };
    
    console.log(`Found ${dataRows.length} rows to process\n`);
    
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const [idx, row] of dataRows.entries()) {
      const rowNum = idx + 3;
      
      const centreName = row[colMap.centre_name];
      const branchName = row[colMap.branch_name];
      const area = row[colMap.area];
      const address = row[colMap.address];
      const postalCode = row[colMap.postal_code];
      const website = row[colMap.website_url];
      const whatsapp = row[colMap.whatsapp_number];
      const sourceUrl = row[colMap.source_url];
      const verificationStatus = row[colMap.verification_status];
      const notes = row[colMap.notes];
      
      // Validation
      if (!centreName || !area) {
        console.log(`⚠️  Row ${rowNum}: Skipping - missing centre_name or area`);
        skipped++;
        continue;
      }
      
      // Build display name (include branch if present)
      const displayName = branchName ? `${centreName} (${branchName})` : centreName;
      
      // Build location string (use address if available, else area)
      const location = address || area;
      
      // Build data quality notes (include source tag + verification + notes)
      const qualityNotes = [
        SOURCE_TAG,
        verificationStatus ? `verification=${verificationStatus}` : null,
        notes ? `notes=${notes}` : null,
      ].filter(Boolean).join('; ');
      
      try {
        // Check if exists (by name + location)
        const existing = await prisma.tuitionCentre.findFirst({
          where: {
            name: displayName,
            location: location,
          },
        });
        
        if (existing) {
          console.log(`⏭️  Row ${rowNum}: Skipping duplicate - ${displayName}`);
          skipped++;
          continue;
        }
        
        // Insert
        await prisma.tuitionCentre.create({
          data: {
            name: displayName,
            location: location,
            whatsappNumber: whatsapp ? String(whatsapp) : '',
            website: website || null,
            dataQualityStatus: 'OK',
            dataQualityNotes: qualityNotes,
          },
        });
        
        console.log(`✅ Row ${rowNum}: Inserted - ${displayName}`);
        inserted++;
        
      } catch (error) {
        console.error(`❌ Row ${rowNum}: Error - ${error.message}`);
        errors++;
      }
    }
    
    console.log('\n📊 INGESTION COMPLETE');
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped (duplicates): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total processed: ${dataRows.length}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

ingestCentres();
