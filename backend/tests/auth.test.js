const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Auth Routes', () => {
  describe('POST /api/user (signup)', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/user').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('Test User');
      expect(res.body.email).toBe('test@example.com');
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app).post('/api/user').send({
        name: 'Test User',
      });

      expect(res.status).toBe(400);
    });

    it('should fail if user already exists', async () => {
      await request(app).post('/api/user').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/user').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/user/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/user').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/user/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('test@example.com');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/user/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app).post('/api/user/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });
});
