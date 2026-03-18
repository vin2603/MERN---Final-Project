const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;
let token;
let token2;
let userId;
let userId2;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create two users for testing
  const user1 = await request(app).post('/api/user').send({
    name: 'User One',
    email: 'user1@example.com',
    password: 'password123',
  });
  token = user1.body.token;
  userId = user1.body._id;

  const user2 = await request(app).post('/api/user').send({
    name: 'User Two',
    email: 'user2@example.com',
    password: 'password123',
  });
  token2 = user2.body.token;
  userId2 = user2.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Chat Routes', () => {
  describe('POST /api/chat (access or create chat)', () => {
    it('should create a new chat between two users', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: userId2 });

      expect(res.status).toBe(200);
      expect(res.body.isGroupChat).toBe(false);
      expect(res.body.users.length).toBe(2);
    });

    it('should return existing chat if already exists', async () => {
      const res1 = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: userId2 });

      const res2 = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: userId2 });

      expect(res1.body._id).toBe(res2.body._id);
    });

    it('should fail without auth token', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ userId: userId2 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/chat (fetch chats)', () => {
    it('should fetch all chats for logged in user', async () => {
      const res = await request(app)
        .get('/api/chat')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should fail without auth token', async () => {
      const res = await request(app).get('/api/chat');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/chat/group (create group chat)', () => {
    it('should create a group chat successfully', async () => {
      // Create a third user to meet the 2+ users requirement
      const user3 = await request(app).post('/api/user').send({
        name: 'User Three',
        email: 'user3@example.com',
        password: 'password123',
      });
      const userId3 = user3.body._id;

      const res = await request(app)
        .post('/api/chat/group')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Group',
          users: JSON.stringify([userId2, userId3]), // ← 2 users now
        });

      expect(res.status).toBe(200);
      expect(res.body.isGroupChat).toBe(true);
      expect(res.body.chatName).toBe('Test Group');
    });

    it('should fail with less than 2 users', async () => {
      const res = await request(app)
        .post('/api/chat/group')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Group',
          users: JSON.stringify([]),
        });

      expect(res.status).toBe(400);
    });

    it('should fail without group name', async () => {
      const res = await request(app)
        .post('/api/chat/group')
        .set('Authorization', `Bearer ${token}`)
        .send({
          users: JSON.stringify([userId2]),
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/chat/:chatId (delete chat)', () => {
    it('should delete a chat successfully', async () => {
      const createRes = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: userId2 });

      const chatId = createRes.body._id;

      const deleteRes = await request(app)
        .delete(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe('Chat deleted successfully');
    });

    it('should fail with invalid chat id', async () => {
      const res = await request(app)
        .delete('/api/chat/invalidid')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
    });
  });
});
