const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;
let token;
let token2;
let userId2;
let chatId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const user1 = await request(app).post('/api/user').send({
    name: 'User One',
    email: 'user1@example.com',
    password: 'password123',
  });
  token = user1.body.token;

  const user2 = await request(app).post('/api/user').send({
    name: 'User Two',
    email: 'user2@example.com',
    password: 'password123',
  });
  token2 = user2.body.token;
  userId2 = user2.body._id;

  const chat = await request(app)
    .post('/api/chat')
    .set('Authorization', `Bearer ${token}`)
    .send({ userId: userId2 });
  chatId = chat.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Message Routes', () => {
  describe('POST /api/message (send message)', () => {
    it('should send a message successfully', async () => {
      const res = await request(app)
        .post('/api/message')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Hello there!',
          chatId: chatId,
        });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Hello there!');
      expect(res.body.chat._id).toBe(chatId);
    });

    it('should fail without content', async () => {
      const res = await request(app)
        .post('/api/message')
        .set('Authorization', `Bearer ${token}`)
        .send({ chatId: chatId });

      expect(res.status).toBe(400);
    });

    it('should fail without chatId', async () => {
      const res = await request(app)
        .post('/api/message')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Hello!' });

      expect(res.status).toBe(400);
    });

    it('should fail without auth token', async () => {
      const res = await request(app)
        .post('/api/message')
        .send({ content: 'Hello!', chatId: chatId });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/message/:chatId (get messages)', () => {
    it('should fetch all messages for a chat', async () => {
      await request(app)
        .post('/api/message')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Test message', chatId: chatId });

      const res = await request(app)
        .get(`/api/message/${chatId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should fail without auth token', async () => {
      const res = await request(app).get(`/api/message/${chatId}`);
      expect(res.status).toBe(401);
    });
  });
});
