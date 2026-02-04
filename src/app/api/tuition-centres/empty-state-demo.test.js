import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { PrismaClient } from '@prisma/client';
import TuitionCentreService from '@/lib/services/tuitionCentreService';

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

/**
 * Empty State Demo Tests
 * Demonstrates the graceful handling of empty states with real-world scenarios
 */

async function cleanupTestData() {
  await prisma.comment.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.tuitionCentreSubject.deleteMany();
  await prisma.tuitionCentreLevel.deleteMany();
  await prisma.tuitionCentre.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.level.deleteMany();
}

async function createSampleCentres() {
  // Create levels
  const primary = await prisma.level.create({ data: { name: 'Primary' } });
  const secondary = await prisma.level.create({ data: { name: 'Secondary' } });
  
  // Create subjects
  const math = await prisma.subject.create({ data: { name: 'Mathematics' } });
  const science = await prisma.subject.create({ data: { name: 'Science' } });
  const english = await prisma.subject.create({ data: { name: 'English' } });

  // Create centres
  await prisma.tuitionCentre.create({
    data: {
      name: 'Tampines Math Academy',
      location: 'Tampines',
      whatsappNumber: '+6591234567',
      levels: { create: [{ level: { connect: { id: primary.id } } }] },
      subjects: { create: [{ subject: { connect: { id: math.id } } }] }
    }
  });

  await prisma.tuitionCentre.create({
    data: {
      name: 'Jurong Science Hub',
      location: 'Jurong',
      whatsappNumber: '+6592345678',
      levels: { create: [{ level: { connect: { id: secondary.id } } }] },
      subjects: { create: [{ subject: { connect: { id: science.id } } }] }
    }
  });

  await prisma.tuitionCentre.create({
    data: {
      name: 'Bedok English Centre',
      location: 'Bedok',
      whatsappNumber: '+6593456789',
      levels: { create: [{ level: { connect: { id: primary.id } } }] },
      subjects: { create: [{ subject: { connect: { id: english.id } } }] }
    }
  });
}

describe('Empty State Demo - Real-World Scenarios', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('Demo 1: User searches for "Orchard" but no centres in that area', async () => {
    await createSampleCentres();

    const request = new Request('http://localhost/api/tuition-centres?search=Orchard');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    console.log('\n📍 Demo 1: Searching for "Orchard"');
    console.log('Status:', response.status);
    console.log('Results:', data.data.length);
    console.log('Message: No centres found in Orchard area');
    console.log('Suggestion: Try searching for Tampines, Jurong, or Bedok\n');

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });

  it('Demo 2: User wants Junior College Physics (not available)', async () => {
    await createSampleCentres();

    const request = new Request('http://localhost/api/tuition-centres?levels=Junior College&subjects=Physics');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    console.log('\n🎓 Demo 2: Looking for Junior College Physics');
    console.log('Status:', response.status);
    console.log('Results:', data.data.length);
    console.log('Message: No Junior College Physics centres available');
    console.log('Suggestion: Try Primary/Secondary levels or Math/Science/English subjects\n');

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  it('Demo 3: User on page 10 when only 1 page exists', async () => {
    await createSampleCentres();

    const request = new Request('http://localhost/api/tuition-centres?page=10&limit=10');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    console.log('\n📄 Demo 3: Requesting page 10 (only 1 page exists)');
    console.log('Status:', response.status);
    console.log('Current Page:', data.pagination.page);
    console.log('Total Pages:', data.pagination.totalPages);
    console.log('Results on this page:', data.data.length);
    console.log('Message: You\'re beyond the last page\n');

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.page).toBe(10);
    expect(data.pagination.totalPages).toBe(1);
  });

  it('Demo 4: Brand new database with no centres yet', async () => {
    // Don't create any centres

    const request = new Request('http://localhost/api/tuition-centres');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    console.log('\n🆕 Demo 4: Brand new database (no centres)');
    console.log('Status:', response.status);
    console.log('Results:', data.data.length);
    console.log('Total centres:', data.pagination.total);
    console.log('Message: No centres available yet. Check back soon!\n');

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });

  it('Demo 5: User searches for typo "Mathmatics" (no fuzzy search)', async () => {
    await createSampleCentres();

    const request = new Request('http://localhost/api/tuition-centres?search=Mathmatics');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    console.log('\n🔤 Demo 5: Typo in search "Mathmatics"');
    console.log('Status:', response.status);
    console.log('Results:', data.data.length);
    console.log('Message: No results for "Mathmatics"');
    console.log('Suggestion: Did you mean "Mathematics"?\n');

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  it('Demo 6: Successful search after adjusting filters', async () => {
    await createSampleCentres();

    // First attempt - no results
    const request1 = new Request('http://localhost/api/tuition-centres?search=Orchard');
    const response1 = await GET(request1, { tuitionCentreService: service });
    const data1 = await response1.json();

    console.log('\n🔄 Demo 6: User adjusts filters after empty result');
    console.log('First attempt (Orchard):', data1.data.length, 'results');

    // Second attempt - with results
    const request2 = new Request('http://localhost/api/tuition-centres?search=Tampines');
    const response2 = await GET(request2, { tuitionCentreService: service });
    const data2 = await response2.json();

    console.log('Second attempt (Tampines):', data2.data.length, 'results');
    console.log('Success! Found:', data2.data[0].name);
    console.log('Message: Adjusting filters helped find results\n');

    expect(response1.status).toBe(200);
    expect(data1.data).toEqual([]);
    expect(response2.status).toBe(200);
    expect(data2.data.length).toBeGreaterThan(0);
  });

  it('Demo 7: All scenarios maintain consistent structure', async () => {
    await createSampleCentres();

    const scenarios = [
      { url: 'http://localhost/api/tuition-centres', desc: 'All centres' },
      { url: 'http://localhost/api/tuition-centres?search=xyz', desc: 'No match' },
      { url: 'http://localhost/api/tuition-centres?page=999', desc: 'Beyond pages' },
    ];

    console.log('\n📊 Demo 7: Response structure consistency');

    for (const scenario of scenarios) {
      const request = new Request(scenario.url);
      const response = await GET(request, { tuitionCentreService: service });
      const data = await response.json();

      console.log(`\n${scenario.desc}:`);
      console.log('  Status:', response.status);
      console.log('  Has data array:', Array.isArray(data.data));
      console.log('  Has pagination:', !!data.pagination);
      console.log('  Structure keys:', Object.keys(data).join(', '));

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
    }

    console.log('\n✅ All scenarios have consistent structure\n');
  });
});
