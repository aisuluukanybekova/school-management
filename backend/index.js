const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');

const app = express();

dotenv.config();

// Подключение маршрутов
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const journalRoutes = require('./routes/journalRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const termRoutes = require('./routes/termRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const teacherSubjectClassRoutes = require('./routes/teacherSubjectClass-routes');
const noticeRoutes = require('./routes/noticeRoutes');
const complainRoutes = require('./routes/complainRoutes');
const lessonTopics = require('./routes/lessonTopics');
const homeroom = require('./routes/homeroom');
const timeSlot =require('./routes/timeSlot');
const aiTutorRoutes = require('./routes/aiTutorRoutes');


const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Подключение к базе данных
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Маршруты
app.use('/api/admins', adminRoutes); 
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/terms', termRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/teacherSubjectClass', teacherSubjectClassRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/complains', complainRoutes);
app.use('/api/lesson-topics', lessonTopics);
app.use('/api/homeroom', homeroom);
app.use('/api/timeslots', timeSlot);
app.use('/api/tutor', aiTutorRoutes);




// Обработка неправильных маршрутов
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Маршрут не найден.' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
