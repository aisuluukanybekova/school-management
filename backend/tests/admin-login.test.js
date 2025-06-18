const request = require('supertest');
const app = require('../app'); // путь к express-приложению
const Admin = require('../models/adminSchema');
const bcrypt = require('bcrypt');

describe('POST /api/admins/login', () => {
  beforeAll(async () => {
    // Очищаем админов и создаём одного
    await Admin.deleteMany({});

    const hashedPassword = await bcrypt.hash('test1234', 10);
    await Admin.create({
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: hashedPassword,
      schoolName: 'Test School'
    });
  });

  it('успешный логин и возврат данных администратора', async () => {
    const res = await request(app)
      .post('/api/admins/login') 
      .send({
        email: 'testadmin@example.com',
        password: 'test1234'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'testadmin@example.com');
    expect(res.body).toHaveProperty('role', 'Admin');
  });

  it('ошибка при неправильном пароле', async () => {
    const res = await request(app)
      .post('/api/admins/login') 
      .send({
        email: 'testadmin@example.com',
        password: 'wrong-password'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Неверный пароль');
  });
});
