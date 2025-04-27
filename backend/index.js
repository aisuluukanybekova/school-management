const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();

const Routes = require("./routes/route.js");
const adminRoutes = require("./routes/adminRoutes.js");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const journalRoutes = require("./routes/journalRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const termRoutes = require("./routes/termRoutes");

const PORT = process.env.PORT || 5001;

dotenv.config();

app.use(express.json({ limit: '10mb' }));
app.use(cors());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// Routes
app.use('/api', Routes);
app.use('/api/admin', adminRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/attendance', attendanceRoutes); // исправили
app.use('/api/terms', termRoutes);

app.listen(PORT, () => {
  console.log(` Server started at port no. ${PORT}`);
});
