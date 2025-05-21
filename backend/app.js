const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Подключение к базе данных
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Роуты
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/journal', require('./routes/journalRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/terms', require('./routes/termRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/teacherSubjectClass', require('./routes/teacherSubjectClass-routes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/complains', require('./routes/complainRoutes'));
app.use('/api/lesson-topics', require('./routes/lessonTopics'));
app.use('/api/homeroom', require('./routes/homeroom'));
app.use('/api/timeslots', require('./routes/timeSlot'));
app.use('/api/tutor', require('./routes/aiTutorRoutes'));
app.use('/api/teacher-complains', require('./routes/teacherComplainRoutes'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Маршрут не найден.' });
});

module.exports = app;
