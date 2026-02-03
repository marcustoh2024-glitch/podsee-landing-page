import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Integration Tests - Community Discussion Forum
 * Tests complete end-to-end flows for authentication, commenting, moderation, and anonymity
 * Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 8.1
 */

// Helper to clean up test data
async function cleanupTestData() {
  await prisma.comment.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tuitionCentreSubject.deleteMany();
  await prisma.tuitionCentreLevel.deleteMany();
  await prisma.tuitionCentre.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.level.deleteMany();
}

// Helper to create test tuition centre
async function createTestCentre() {
  const level = await prisma.level.create({ data: { name: 'Primary' } });
  const subject = await prisma.subject.create({ data: { name: 'Mathematics' } });

  const centre = await prisma.tuitionCentre.create({
    data: {
      name: 'Test Learning Centre',
      location: 'Tampines',
      whatsappNumber: '+6591234567',
      website: 'https://test.com',
      levels: {
        create: [{ level: { connect: { id: level.id } } }]
      },
      subjects: {
        create: [{ subject: { connect: { id: subject.id } } }]
      }
    }
  });

  return centre;
}

describe('Integration Tests - Community Discussion Forum', () => {
  let testCentre;

  beforeAll(async () => {
    await cleanupTestData();
    testCentre = await createTestCentre();
  });

  afterAll(async () => {
