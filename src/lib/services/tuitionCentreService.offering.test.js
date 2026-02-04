import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import TuitionCentreService from './tuitionCentreService.js';

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

describe('TuitionCentreService - Offering Filter Logic', () => {
  let testCentre1, testCentre2, testLevel1, testLevel2, testSubject1, testSubject2;

  beforeAll(async () => {
    // Create test data
    testLevel1 = await prisma.level.create({
      data: { name: 'Test Level 1' }
    });
    testLevel2 = await prisma.level.create({
      data: { name: 'Test Level 2' }
    });
    testSubject1 = await prisma.subject.create({
      data: { name: 'Test Subject 1' }
    });
    testSubject2 = await prisma.subject.create({
      data: { name: 'Test Subject 2' }
    });

    // Centre 1: Offers Level1+Subject1 and Level2+Subject2
    testCentre1 = await prisma.tuitionCentre.create({
      data: {
        name: 'Test Centre 1',
        location: 'Test Location 1',
        whatsappNumber: '+6512345678',
        levels: {
          create: [
            { level: { connect: { id: testLevel1.id } } },
            { level: { connect: { id: testLevel2.id } } }
          ]
        },
        subjects: {
          create: [
            { subject: { connect: { id: testSubject1.id } } },
            { subject: { connect: { id: testSubject2.id } } }
          ]
        },
        offerings: {
          create: [
            { levelId: testLevel1.id, subjectId: testSubject1.id },
            { levelId: testLevel2.id, subjectId: testSubject2.id }
          ]
        }
      }
    });

    // Centre 2: Offers Level1+Subject2 and Level2+Subject1
    testCentre2 = await prisma.tuitionCentre.create({
      data: {
        name: 'Test Centre 2',
        location: 'Test Location 2',
        whatsappNumber: '+6587654321',
        levels: {
          create: [
            { level: { connect: { id: testLevel1.id } } },
            { level: { connect: { id: testLevel2.id } } }
          ]
        },
        subjects: {
          create: [
            { subject: { connect: { id: testSubject1.id } } },
            { subject: { connect: { id: testSubject2.id } } }
          ]
        },
        offerings: {
          create: [
            { levelId: testLevel1.id, subjectId: testSubject2.id },
            { levelId: testLevel2.id, subjectId: testSubject1.id }
          ]
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.offering.deleteMany({
      where: {
        OR: [
          { tuitionCentreId: testCentre1.id },
          { tuitionCentreId: testCentre2.id }
        ]
      }
    });
    await prisma.tuitionCentreLevel.deleteMany({
      where: {
        OR: [
          { tuitionCentreId: testCentre1.id },
          { tuitionCentreId: testCentre2.id }
        ]
      }
    });
    await prisma.tuitionCentreSubject.deleteMany({
      where: {
        OR: [
          { tuitionCentreId: testCentre1.id },
          { tuitionCentreId: testCentre2.id }
        ]
      }
    });
    await prisma.tuitionCentre.deleteMany({
      where: {
        OR: [
          { id: testCentre1.id },
          { id: testCentre2.id }
        ]
      }
    });
    await prisma.level.deleteMany({
      where: {
        OR: [
          { id: testLevel1.id },
          { id: testLevel2.id }
        ]
      }
    });
    await prisma.subject.deleteMany({
      where: {
        OR: [
          { id: testSubject1.id },
          { id: testSubject2.id }
        ]
      }
    });
    await prisma.$disconnect();
  });

  it('should return centres with specific level only', async () => {
    const result = await service.searchTuitionCentres({
      levels: ['Test Level 1']
    });

    expect(result.data.length).toBeGreaterThanOrEqual(2);
    const centreIds = result.data.map(c => c.id);
    expect(centreIds).toContain(testCentre1.id);
    expect(centreIds).toContain(testCentre2.id);
  });

  it('should return centres with specific subject only', async () => {
    const result = await service.searchTuitionCentres({
      subjects: ['Test Subject 1']
    });

    expect(result.data.length).toBeGreaterThanOrEqual(2);
    const centreIds = result.data.map(c => c.id);
    expect(centreIds).toContain(testCentre1.id);
    expect(centreIds).toContain(testCentre2.id);
  });

  it('should return only centres with Level1+Subject1 combination', async () => {
    const result = await service.searchTuitionCentres({
      levels: ['Test Level 1'],
      subjects: ['Test Subject 1']
    });

    const centreIds = result.data.map(c => c.id);
    expect(centreIds).toContain(testCentre1.id);
    expect(centreIds).not.toContain(testCentre2.id);
  });

  it('should return only centres with Level1+Subject2 combination', async () => {
    const result = await service.searchTuitionCentres({
      levels: ['Test Level 1'],
      subjects: ['Test Subject 2']
    });

    const centreIds = result.data.map(c => c.id);
    expect(centreIds).not.toContain(testCentre1.id);
    expect(centreIds).toContain(testCentre2.id);
  });

  it('should return only centres with Level2+Subject1 combination', async () => {
    const result = await service.searchTuitionCentres({
      levels: ['Test Level 2'],
      subjects: ['Test Subject 1']
    });

    const centreIds = result.data.map(c => c.id);
    expect(centreIds).not.toContain(testCentre1.id);
    expect(centreIds).toContain(testCentre2.id);
  });

  it('should return only centres with Level2+Subject2 combination', async () => {
    const result = await service.searchTuitionCentres({
      levels: ['Test Level 2'],
      subjects: ['Test Subject 2']
    });

    const centreIds = result.data.map(c => c.id);
    expect(centreIds).toContain(testCentre1.id);
    expect(centreIds).not.toContain(testCentre2.id);
  });

  it('should return centres with any of multiple level-subject combinations', async () => {
    const result = await service.searchTuitionCentres({
      levels: ['Test Level 1', 'Test Level 2'],
      subjects: ['Test Subject 1']
    });

    // Should return both centres because:
    // - Centre 1 has Level1+Subject1
    // - Centre 2 has Level2+Subject1
    const centreIds = result.data.map(c => c.id);
    expect(centreIds).toContain(testCentre1.id);
    expect(centreIds).toContain(testCentre2.id);
  });

  it('should not return centres when level-subject combination does not exist', async () => {
    // Create a level and subject that no centre offers together
    const unusedLevel = await prisma.level.create({
      data: { name: 'Unused Test Level' }
    });
    const unusedSubject = await prisma.subject.create({
      data: { name: 'Unused Test Subject' }
    });

    const result = await service.searchTuitionCentres({
      levels: ['Unused Test Level'],
      subjects: ['Unused Test Subject']
    });

    expect(result.data.length).toBe(0);

    // Clean up
    await prisma.level.delete({ where: { id: unusedLevel.id } });
    await prisma.subject.delete({ where: { id: unusedSubject.id } });
  });
});
