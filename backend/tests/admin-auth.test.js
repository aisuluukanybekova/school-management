const request = require('supertest');
const app = require('../app');

describe('POST /api/admins/login', () => {
  it('should return 400 if user not found', async () => {
    const response = await request(app).post('/api/admins/login').send({
      email: 'nonexistent@example.com',
      password: 'wrongpass'
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Пользователь не найден');
  });
});
