import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { generateTestEmail } from '@/lib/testUtils';

const prisma = new PrismaClient();

/**
 * Integration Tests - Community Discussion Forum
 * Tests complete end-to-end flows for authentication, commenting, moderation, and anonymity
 * Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 8.1
 */

// Helper to clean up test data
// CRITICAL: Deletion order must respect foreign key constraints
// Order: comments → discussion threads → tuition centres (with relations) → users → levels/subjects
async function cleanupTestData() {
  // Delete in correct order to respect foreign key constraints
  await prisma.comment.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.tuitionCentreSubject.deleteMany();
  await prisma.tuitionCentreLevel.deleteMany();
  await prisma.tuitionCentre.deleteMany();
  await prisma.user.deleteMany();
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
    await cleanupTestData();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up comments, threads, and users before each test
    // Order matters: comments → threads → users
    await prisma.comment.deleteMany();
    await prisma.discussionThread.deleteMany();
    await prisma.user.deleteMany();
  });

  /**
   * Test Flow 1: Login → Create Comment → Read Comments
   * Requirements: 1.1, 3.1, 4.1
   */
  describe('Flow 1: Login → Create Comment → Read Comments', () => {
    it('should allow a parent to login, create a comment, and read it back', async () => {
      // Step 1: Login (create new user)
      const { POST: loginPost } = await import('../auth/login/route.js');
      
      const uniqueEmail = generateTestEmail('parent');
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: uniqueEmail,
          password: 'securepassword123',
          role: 'PARENT'
        })
      });

      const loginResponse = await loginPost(loginRequest);
      const loginData = await loginResponse.json();

      expect(loginResponse.status).toBe(200);
      expect(loginData.user).toBeDefined();
      expect(loginData.user.email).toBe(uniqueEmail);
      expect(loginData.user.role).toBe('PARENT');
      expect(loginData.token).toBeDefined();

      const token = loginData.token;
      const userId = loginData.user.id;

      // Step 2: Create a comment
      const { POST: discussionPost } = await import('./[centreId]/route.js');
      
      const createCommentRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            body: 'This is a great tuition centre!',
            isAnonymous: false
          })
        }
      );

      const createCommentResponse = await discussionPost(createCommentRequest, {
        params: { centreId: testCentre.id }
      });
      const createCommentData = await createCommentResponse.json();

      expect(createCommentResponse.status).toBe(201);
      expect(createCommentData.comment).toBeDefined();
      expect(createCommentData.comment.body).toBe('This is a great tuition centre!');
      expect(createCommentData.comment.isAnonymous).toBe(false);
      expect(createCommentData.comment.author).toBeDefined();
      expect(createCommentData.comment.author.id).toBe(userId);

      // Step 3: Read comments back
      const { GET: discussionGet } = await import('./[centreId]/route.js');
      
      const getCommentsRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`
      );

      const getCommentsResponse = await discussionGet(getCommentsRequest, {
        params: { centreId: testCentre.id }
      });
      const getCommentsData = await getCommentsResponse.json();

      expect(getCommentsResponse.status).toBe(200);
      expect(getCommentsData.thread).toBeDefined();
      expect(getCommentsData.thread.tuitionCentreId).toBe(testCentre.id);
      expect(getCommentsData.comments).toHaveLength(1);
      expect(getCommentsData.comments[0].body).toBe('This is a great tuition centre!');
      expect(getCommentsData.comments[0].author.email).toBe(uniqueEmail);
    });

    it('should allow multiple comments from the same user', async () => {
      // Login
      const { POST: loginPost } = await import('../auth/login/route.js');
      const uniqueEmail = generateTestEmail('parent');
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: uniqueEmail,
          password: 'password12345678',
          role: 'PARENT'
        })
      });

      const loginResponse = await loginPost(loginRequest);
      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Create first comment
      const { POST: discussionPost } = await import('./[centreId]/route.js');
      
      const comment1Request = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            body: 'First comment',
            isAnonymous: false
          })
        }
      );

      await discussionPost(comment1Request, { params: { centreId: testCentre.id } });

      // Create second comment
      const comment2Request = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            body: 'Second comment',
            isAnonymous: false
          })
        }
      );

      await discussionPost(comment2Request, { params: { centreId: testCentre.id } });

      // Read comments
      const { GET: discussionGet } = await import('./[centreId]/route.js');
      const getRequest = new Request(`http://localhost/api/discussions/${testCentre.id}`);
      const getResponse = await discussionGet(getRequest, {
        params: { centreId: testCentre.id }
      });
      const getData = await getResponse.json();

      expect(getData.comments).toHaveLength(2);
      expect(getData.comments[0].body).toBe('First comment');
      expect(getData.comments[1].body).toBe('Second comment');
      // Verify chronological order (oldest first)
      expect(new Date(getData.comments[0].createdAt).getTime())
        .toBeLessThan(new Date(getData.comments[1].createdAt).getTime());
    });
  });

  /**
   * Test Flow 2: Create Comment → Hide → Verify Hidden
   * Requirements: 6.1
   */
  describe('Flow 2: Moderation - Create Comment → Hide → Verify Hidden', () => {
    it('should allow admin to hide a comment and verify it is excluded from public view', async () => {
      // Step 1: Create a parent user and comment
      const { POST: loginPost } = await import('../auth/login/route.js');
      
      const parentEmail = generateTestEmail('parent');
      const parentLoginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: parentEmail,
          password: 'password12345678',
          role: 'PARENT'
        })
      });

      const parentLoginResponse = await loginPost(parentLoginRequest);
      const parentLoginData = await parentLoginResponse.json();
      const parentToken = parentLoginData.token;

      // Create comment
      const { POST: discussionPost } = await import('./[centreId]/route.js');
      
      const createCommentRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${parentToken}` },
          body: JSON.stringify({
            body: 'Inappropriate comment that should be hidden',
            isAnonymous: false
          })
        }
      );

      const createCommentResponse = await discussionPost(createCommentRequest, {
        params: { centreId: testCentre.id }
      });
      const createCommentData = await createCommentResponse.json();
      const commentId = createCommentData.comment.id;

      // Step 2: Create admin user and hide the comment
      const adminEmail = generateTestEmail('admin');
      const adminLoginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: 'adminpassword123',
          role: 'ADMIN'
        })
      });

      const adminLoginResponse = await loginPost(adminLoginRequest);
      const adminLoginData = await adminLoginResponse.json();
      const adminToken = adminLoginData.token;

      // Hide the comment
      const { PATCH: discussionPatch } = await import(
        './[centreId]/[commentId]/route.js'
      );
      
      const hideCommentRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}/${commentId}`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ isHidden: true })
        }
      );

      const hideCommentResponse = await discussionPatch(hideCommentRequest, {
        params: { centreId: testCentre.id, commentId }
      });
      const hideCommentData = await hideCommentResponse.json();

      expect(hideCommentResponse.status).toBe(200);
      expect(hideCommentData.comment.isHidden).toBe(true);

      // Step 3: Verify comment is hidden from public view
      const { GET: discussionGet } = await import('./[centreId]/route.js');
      
      const getCommentsRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`
      );

      const getCommentsResponse = await discussionGet(getCommentsRequest, {
        params: { centreId: testCentre.id }
      });
      const getCommentsData = await getCommentsResponse.json();

      expect(getCommentsResponse.status).toBe(200);
      expect(getCommentsData.comments).toHaveLength(0); // Hidden comment should not appear
    });

    it('should allow admin to unhide a comment and restore visibility', async () => {
      // Create parent and comment
      const { POST: loginPost } = await import('../auth/login/route.js');
      
      const parentEmail = generateTestEmail('parent');
      const parentLoginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: parentEmail,
          password: 'password12345678',
          role: 'PARENT'
        })
      });

      const parentLoginResponse = await loginPost(parentLoginRequest);
      const parentLoginData = await parentLoginResponse.json();
      const parentToken = parentLoginData.token;

      const { POST: discussionPost } = await import('./[centreId]/route.js');
      
      const createCommentRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${parentToken}` },
          body: JSON.stringify({
            body: 'Comment to be hidden then unhidden',
            isAnonymous: false
          })
        }
      );

      const createCommentResponse = await discussionPost(createCommentRequest, {
        params: { centreId: testCentre.id }
      });
      const commentId = createCommentResponse.json().then(d => d.comment.id);

      // Create admin and hide comment
      const adminEmail = generateTestEmail('admin');
      const adminLoginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: 'adminpassword123',
          role: 'ADMIN'
        })
      });

      const adminLoginResponse = await loginPost(adminLoginRequest);
      const adminLoginData = await adminLoginResponse.json();
      const adminToken = adminLoginData.token;

      const { PATCH: discussionPatch } = await import(
        './[centreId]/[commentId]/route.js'
      );
      
      const hideRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}/${await commentId}`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ isHidden: true })
        }
      );

      await discussionPatch(hideRequest, {
        params: { centreId: testCentre.id, commentId: await commentId }
      });

      // Unhide the comment
      const unhideRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}/${await commentId}`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ isHidden: false })
        }
      );

      const unhideResponse = await discussionPatch(unhideRequest, {
        params: { centreId: testCentre.id, commentId: await commentId }
      });
      const unhideData = await unhideResponse.json();

      expect(unhideResponse.status).toBe(200);
      expect(unhideData.comment.isHidden).toBe(false);

      // Verify comment is visible again
      const { GET: discussionGet } = await import('./[centreId]/route.js');
      
      const getRequest = new Request(`http://localhost/api/discussions/${testCentre.id}`);
      const getResponse = await discussionGet(getRequest, {
        params: { centreId: testCentre.id }
      });
      const getData = await getResponse.json();

      expect(getData.comments).toHaveLength(1);
      expect(getData.comments[0].body).toBe('Comment to be hidden then unhidden');
    });
  });

  /**
   * Test Flow 3: Create Anonymous Comment → Verify Author Hidden
   * Requirements: 8.1
   */
  describe('Flow 3: Anonymous - Create Anonymous Comment → Verify Author Hidden', () => {
    it('should hide author identity for anonymous comments in public view', async () => {
      // Step 1: Login as parent
      const { POST: loginPost } = await import('../auth/login/route.js');
      
      const uniqueEmail = generateTestEmail('anonymous-parent');
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: uniqueEmail,
          password: 'password12345678',
          role: 'PARENT'
        })
      });

      const loginResponse = await loginPost(loginRequest);
      const loginData = await loginResponse.json();
      const token = loginData.token;
      const userId = loginData.user.id;

      // Step 2: Create anonymous comment
      const { POST: discussionPost } = await import('./[centreId]/route.js');
      
      const createCommentRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            body: 'This is an anonymous comment',
            isAnonymous: true
          })
        }
      );

      const createCommentResponse = await discussionPost(createCommentRequest, {
        params: { centreId: testCentre.id }
      });
      const createCommentData = await createCommentResponse.json();

      expect(createCommentResponse.status).toBe(201);
      expect(createCommentData.comment.isAnonymous).toBe(true);
      expect(createCommentData.comment.author).toBeNull(); // Author hidden in response

      // Step 3: Verify author is hidden in public view
      const { GET: discussionGet } = await import('./[centreId]/route.js');
      
      const getCommentsRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`
      );

      const getCommentsResponse = await discussionGet(getCommentsRequest, {
        params: { centreId: testCentre.id }
      });
      const getCommentsData = await getCommentsResponse.json();

      expect(getCommentsResponse.status).toBe(200);
      expect(getCommentsData.comments).toHaveLength(1);
      expect(getCommentsData.comments[0].isAnonymous).toBe(true);
      expect(getCommentsData.comments[0].author).toBeNull(); // Author hidden

      // Step 4: Verify author is stored internally in database
      const commentInDb = await prisma.comment.findFirst({
        where: { body: 'This is an anonymous comment' }
      });

      expect(commentInDb).toBeDefined();
      expect(commentInDb.authorId).toBe(userId); // Author ID stored internally
      expect(commentInDb.isAnonymous).toBe(true);
    });

    it('should show author for non-anonymous comments', async () => {
      // Login as parent
      const { POST: loginPost } = await import('../auth/login/route.js');
      
      const uniqueEmail = generateTestEmail('identified-parent');
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: uniqueEmail,
          password: 'password12345678',
          role: 'PARENT'
        })
      });

      const loginResponse = await loginPost(loginRequest);
      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Create non-anonymous comment
      const { POST: discussionPost } = await import('./[centreId]/route.js');
      
      const createCommentRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            body: 'This is a public comment',
            isAnonymous: false
          })
        }
      );

      const createCommentResponse = await discussionPost(createCommentRequest, {
        params: { centreId: testCentre.id }
      });
      const createCommentData = await createCommentResponse.json();

      expect(createCommentResponse.status).toBe(201);
      expect(createCommentData.comment.isAnonymous).toBe(false);
      expect(createCommentData.comment.author).toBeDefined();
      expect(createCommentData.comment.author.email).toBe(uniqueEmail);

      // Verify author is visible in public view
      const { GET: discussionGet } = await import('./[centreId]/route.js');
      
      const getRequest = new Request(`http://localhost/api/discussions/${testCentre.id}`);
      const getResponse = await discussionGet(getRequest, {
        params: { centreId: testCentre.id }
      });
      const getData = await getResponse.json();

      expect(getData.comments).toHaveLength(1);
      expect(getData.comments[0].author).toBeDefined();
      expect(getData.comments[0].author.email).toBe(uniqueEmail);
    });
  });

  /**
   * Test Flow 4: Centre Login → Create Comment → Verify Role Displayed
   * Requirements: 5.1
   */
  describe('Flow 4: Centre - Centre Login → Create Comment → Verify Role Displayed', () => {
    it('should display centre role when centre account creates a comment', async () => {
      // Step 1: Login as centre
      const { POST: loginPost } = await import('../auth/login/route.js');
      
      const centreEmail = generateTestEmail('centre');
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: centreEmail,
          password: 'centrepassword123',
          role: 'CENTRE'
        })
      });

      const loginResponse = await loginPost(loginRequest);
      const loginData = await loginResponse.json();

      expect(loginResponse.status).toBe(200);
      expect(loginData.user.role).toBe('CENTRE');

      const token = loginData.token;

      // Step 2: Create comment as centre
      const { POST: discussionPost } = await import('./[centreId]/route.js');
      
      const createCommentRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            body: 'Thank you for your interest in our centre!',
            isAnonymous: false
          })
        }
      );

      const createCommentResponse = await discussionPost(createCommentRequest, {
        params: { centreId: testCentre.id }
      });
      const createCommentData = await createCommentResponse.json();

      expect(createCommentResponse.status).toBe(201);
      expect(createCommentData.comment.author).toBeDefined();
      expect(createCommentData.comment.author.role).toBe('CENTRE');

      // Step 3: Verify role is displayed in public view
      const { GET: discussionGet } = await import('./[centreId]/route.js');
      
      const getCommentsRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`
      );

      const getCommentsResponse = await discussionGet(getCommentsRequest, {
        params: { centreId: testCentre.id }
      });
      const getCommentsData = await getCommentsResponse.json();

      expect(getCommentsResponse.status).toBe(200);
      expect(getCommentsData.comments).toHaveLength(1);
      expect(getCommentsData.comments[0].author).toBeDefined();
      expect(getCommentsData.comments[0].author.role).toBe('CENTRE');
      expect(getCommentsData.comments[0].author.email).toBe(centreEmail);
    });

    it('should prevent centre accounts from posting anonymously', async () => {
      // Login as centre
      const { POST: loginPost } = await import('../auth/login/route.js');
      
      const centreEmail = generateTestEmail('centre');
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: centreEmail,
          password: 'centrepassword123',
          role: 'CENTRE'
        })
      });

      const loginResponse = await loginPost(loginRequest);
      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Attempt to create anonymous comment as centre
      const { POST: discussionPost } = await import('./[centreId]/route.js');
      
      const createCommentRequest = new Request(
        `http://localhost/api/discussions/${testCentre.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            body: 'Trying to post anonymously',
            isAnonymous: true
          })
        }
      );

      const createCommentResponse = await discussionPost(createCommentRequest, {
        params: { centreId: testCentre.id }
      });
      const createCommentData = await createCommentResponse.json();

      expect(createCommentResponse.status).toBe(403);
      expect(createCommentData.error).toBeDefined();
      expect(createCommentData.error.code).toBe('FORBIDDEN_ANONYMOUS_CENTRE');
    });
  });

  /**
   * Test Flow 5: Mixed Scenario - Multiple Users and Comment Types
   */
  describe('Flow 5: Mixed Scenario - Multiple Users and Comment Types', () => {
    it('should handle multiple users with different roles and anonymity settings', async () => {
      const { POST: loginPost } = await import('../auth/login/route.js');
      const { POST: discussionPost } = await import('./[centreId]/route.js');

      // Create parent 1 (anonymous comment)
      const parent1Login = await loginPost(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'parent1@example.com',
          password: 'password12345678',
          role: 'PARENT'
        })
      }));
      const parent1Data = await parent1Login.json();

      await discussionPost(new Request(`http://localhost/api/discussions/${testCentre.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${parent1Data.token}` },
        body: JSON.stringify({
          body: 'Anonymous parent comment',
          isAnonymous: true
        })
      }), { params: { centreId: testCentre.id } });

      // Create parent 2 (public comment)
      const parent2Login = await loginPost(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'parent2@example.com',
          password: 'password12345678',
          role: 'PARENT'
        })
      }));
      const parent2Data = await parent2Login.json();

      await discussionPost(new Request(`http://localhost/api/discussions/${testCentre.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${parent2Data.token}` },
        body: JSON.stringify({
          body: 'Public parent comment',
          isAnonymous: false
        })
      }), { params: { centreId: testCentre.id } });

      // Create centre comment
      const centreLogin = await loginPost(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'centre@example.com',
          password: 'password12345678',
          role: 'CENTRE'
        })
      }));
      const centreData = await centreLogin.json();

      await discussionPost(new Request(`http://localhost/api/discussions/${testCentre.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${centreData.token}` },
        body: JSON.stringify({
          body: 'Centre response',
          isAnonymous: false
        })
      }), { params: { centreId: testCentre.id } });

      // Read all comments
      const { GET: discussionGet } = await import('./[centreId]/route.js');
      const getResponse = await discussionGet(
        new Request(`http://localhost/api/discussions/${testCentre.id}`),
        { params: { centreId: testCentre.id } }
      );
      const getData = await getResponse.json();

      expect(getData.comments).toHaveLength(3);

      // Verify anonymous comment
      const anonymousComment = getData.comments.find(c => c.body === 'Anonymous parent comment');
      expect(anonymousComment.isAnonymous).toBe(true);
      expect(anonymousComment.author).toBeNull();

      // Verify public parent comment
      const publicComment = getData.comments.find(c => c.body === 'Public parent comment');
      expect(publicComment.isAnonymous).toBe(false);
      expect(publicComment.author.email).toBe('parent2@example.com');
      expect(publicComment.author.role).toBe('PARENT');

      // Verify centre comment
      const centreComment = getData.comments.find(c => c.body === 'Centre response');
      expect(centreComment.isAnonymous).toBe(false);
      expect(centreComment.author.email).toBe('centre@example.com');
      expect(centreComment.author.role).toBe('CENTRE');
    });
  });
});
