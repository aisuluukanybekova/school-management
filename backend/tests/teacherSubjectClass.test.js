const request = require('supertest');
const app = require('../app'); 
const mongoose = require('mongoose');
const TeacherSubjectClass = require('../models/teacherSubjectClass');

describe('TeacherSubjectClass API', () => {
  let createdId;

  const testData = {
    teacherID: new mongoose.Types.ObjectId(),
    subjectId: new mongoose.Types.ObjectId(),
    sclassName: new mongoose.Types.ObjectId(),
    sessions: 10
  };

  it('should create a new teacher-subject-class record', async () => {
    const res = await request(app)
      .post('/api/teacherSubjectClass')
      .send(testData);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Предмет успешно назначен");
    createdId = res.body.record._id;
  });

  it('should get all teacher-subject-class records', async () => {
    const res = await request(app).get('/api/teacherSubjectClass');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should update a teacher-subject-class record', async () => {
    const res = await request(app)
      .put(`/api/teacherSubjectClass/${createdId}`)
      .send({ ...testData, sessions: 15 });

    expect(res.statusCode).toBe(200);
    expect(res.body.updated.sessions).toBe(15);
  });

  it('should delete the teacher-subject-class record', async () => {
    const res = await request(app).delete(`/api/teacherSubjectClass/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Назначение удалено");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
