import React, { useState, useEffect } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem,
  Button, TextField,
} from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5001';

function TeacherGradebookJournal() {
  const teacher = useSelector((state) => state.user.currentUser);
  const schoolId = teacher?.school?._id || teacher?.schoolId || teacher?.school_id;

  const [assignments, setAssignments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [lessonDates, setLessonDates] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1');

  const getAverageColor = (avg) => {
    if (avg >= 5) return '#d4edda';
    if (avg === 4) return '#dbeeff';
    if (avg === 3) return '#fff3cd';
    return '#f8d7da';
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [assignRes, termRes] = await Promise.all([
          axios.get(`/api/teacherSubjectClass/by-teacher/${teacher._id}`),
          axios.get(`/api/terms/${schoolId}`),
        ]);
        setAssignments(assignRes.data);
        setTerms(termRes.data);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
      }
    };
    if (teacher && schoolId) loadInitialData();
  }, [teacher, schoolId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const termReady = terms.length > 0;
        if (termReady) {
          await fetchStudents();
          await fetchGrades();
          await fetchLessonDates();
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };
    if (selectedClass && selectedSubject && selectedTerm) {
      loadData();
    }
  }, [selectedClass, selectedSubject, selectedTerm, terms]);

  const fetchLessonDates = async () => {
    try {
      const term = terms.find((t) => t.termNumber === Number(selectedTerm));
      if (!term) return setLessonDates([]);

      const res = await axios.get(
        `/api/schedule/by-teacher-class-subject/${teacher._id}/${selectedClass}/${selectedSubject}`,
      );
      const schedule = res.data.schedules || [];

      const termStart = new Date(term.startDate);
      const termEnd = new Date(term.endDate);
      const enDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const allDates = [];

      schedule.forEach((s) => {
        const d = new Date(termStart);
        while (d <= termEnd) {
          const current = new Date(d);
          if (enDayNames[current.getDay()] === s.day) {
            allDates.push(current.toISOString().split('T')[0]);
          }
          d.setDate(d.getDate() + 1);
        }
      });

      const uniqueDates = [...new Set(allDates)].sort();
      setLessonDates(uniqueDates);
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
      setLessonDates([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`/api/students/class/${selectedClass}`);
      setStudents(res.data || []);
    } catch (err) {
      console.error('Ошибка загрузки студентов:', err);
      setStudents([]);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await axios.get('/api/journal/grades', {
        params: {
          classId: selectedClass,
          subjectId: selectedSubject,
          term: Number(selectedTerm),
        },
      });
      const gradebook = res.data;
      setGrades(Array.isArray(gradebook?.grades) ? gradebook.grades : []);
    } catch (err) {
      console.error('Ошибка загрузки оценок:', err);
      setGrades([]);
    }
  };

  const handleGradeChange = (studentId, date, grade) => {
    if (isNaN(grade) || grade < 2 || grade > 5) {
      alert('Оценка должна быть целым числом от 2 до 5');
      return;
    }

    setGrades((prev) => {
      const updated = [...prev];
      let entry = updated.find((e) => e.studentId === studentId);
      if (!entry) {
        entry = { studentId, values: [] };
        updated.push(entry);
      }
      const existing = entry.values.find((v) => v.date === date);
      if (existing) {
        existing.grade = grade;
      } else {
        entry.values.push({ date, grade });
      }
      return updated;
    });
  };

  const saveGrades = async () => {
    try {
      await axios.post('/api/journal/grades', {
        classId: selectedClass,
        subjectId: selectedSubject,
        teacherId: teacher._id,
        term: Number(selectedTerm),
        grades,
      });
      alert('Оценки сохранены');
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      alert('Ошибка при сохранении оценок');
    }
  };

  const currentTerm = terms.find((t) => t.termNumber === Number(selectedTerm));

  return (
    <Box p={3}>
      {/* Фильтры */}
      <Box display="flex" gap={2} mt={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel>Класс</InputLabel>
          <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {assignments.map((a, i) => (
              <MenuItem key={i} value={a.sclassId}>{a.sclassName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Предмет</InputLabel>
          <Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            {assignments.map((a, i) => (
              <MenuItem key={i} value={a.subjectId}>{a.subjectName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Четверть</InputLabel>
          <Select value={selectedTerm} onChange={(e) => setSelectedTerm(String(e.target.value))}>
            {[1, 2, 3, 4].map((term) => (
              <MenuItem key={term} value={String(term)}>
                Четверть
                {term}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {currentTerm && (
        <Box mb={2}>
          Период:
          {' '}
          {new Date(currentTerm.startDate).toLocaleDateString('ru-RU')}
          {' '}
          —
          {' '}
          {new Date(currentTerm.endDate).toLocaleDateString('ru-RU')}
        </Box>
      )}

      {/* Таблица */}
      <Box sx={{ overflowX: 'auto', border: '1px solid #ccc', borderRadius: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `50px 200px repeat(${lessonDates.length}, 100px) 100px`,
            backgroundColor: '#000',
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 3,
          }}
        >
          <Box sx={{
            border: '1px solid #ccc', p: 1, position: 'sticky', left: 0, zIndex: 4,
          }}
          >
            №
          </Box>
          <Box sx={{
            border: '1px solid #ccc', p: 1, position: 'sticky', left: 50, zIndex: 4,
          }}
          >
            Ученик
          </Box>
          {lessonDates.map((date) => (
            <Box
              key={date}
              sx={{
                border: '1px solid #ccc',
                p: 1,
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: '80px',
                textAlign: 'center',
                backgroundColor: '#000',
                color: '#fff',
              }}
            >
              {new Date(date).toLocaleDateString('ru-RU')}
            </Box>
          ))}
          <Box sx={{
            border: '1px solid #ccc', p: 1, position: 'sticky', right: 0, zIndex: 4,
          }}
          >
            Итог
          </Box>
        </Box>

        {students.sort((a, b) => a.name.localeCompare(b.name, 'ru')).map((student, index) => {
          const gradeEntry = grades.find((g) => g.studentId === student._id) || { values: [] };
          const valuesOnly = gradeEntry.values.filter((v) => v.grade);
          const average = valuesOnly.length > 0
            ? Math.round(valuesOnly.reduce((sum, v) => sum + v.grade, 0) / valuesOnly.length)
            : null;

          return (
            <Box
              key={student._id}
              sx={{
                display: 'grid',
                gridTemplateColumns: `50px 200px repeat(${lessonDates.length}, 100px) 100px`,
                backgroundColor: '#fff',
              }}
            >
              <Box sx={{
                border: '1px solid #ccc', p: 1, textAlign: 'center', position: 'sticky', left: 0, zIndex: 2,
              }}
              >
                {index + 1}
              </Box>
              <Box sx={{
                border: '1px solid #ccc', p: 1, fontWeight: 500, position: 'sticky', left: 50, zIndex: 2,
              }}
              >
                {student.name}
              </Box>

              {lessonDates.map((date) => {
                const g = gradeEntry.values.find((v) => v.date === date);
                return (
                  <Box
                    key={date}
                    sx={{
                      border: '1px solid #ccc',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 1,
                      backgroundColor:
                        g?.grade === 5 ? '#d4edda'
                          : g?.grade === 4 ? '#dbeeff'
                            : g?.grade === 3 ? '#fff3cd'
                              : g?.grade === 2 ? '#f8d7da'
                                : '#f5f5f5',
                    }}
                  >
                    <TextField
                      type="number"
                      inputProps={{ min: 2, max: 5 }}
                      value={g?.grade || ''}
                      size="small"
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          width: '2.5rem',
                          input: { textAlign: 'center' },
                        },
                      }}
                      onChange={(e) => handleGradeChange(student._id, date, parseInt(e.target.value))}
                    />
                  </Box>
                );
              })}

              <Box
                sx={{
                  p: 1,
                  textAlign: 'center',
                  fontWeight: 600,
                  position: 'sticky',
                  right: 0,
                  backgroundColor: average ? getAverageColor(average) : '#fff',
                  border: '1px solid #ccc',
                  zIndex: 3,
                }}
              >
                {average || '-'}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Статистика */}
      {students.length > 0 && (
        <Box mt={4} p={2} sx={{ border: '1px dashed #999', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
          <Box fontWeight="bold" mb={1}>📊 Статистика по итоговым оценкам:</Box>
          {(() => {
            const counters = {
              5: 0, 4: 0, 3: 0, 2: 0, none: 0,
            };
            students.forEach((student) => {
              const entry = grades.find((g) => g.studentId === student._id);
              const values = entry?.values?.filter((v) => v.grade) || [];
              if (!values.length) {
                counters.none += 1;
              } else {
                const avg = Math.round(values.reduce((a, b) => a + b.grade, 0) / values.length);
                if (avg >= 2 && avg <= 5) counters[avg]++;
              }
            });

            return (
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box>
                  Отличников (5):
                  <strong>{counters[5]}</strong>
                </Box>
                <Box>
                  Хорошистов (4):
                  <strong>{counters[4]}</strong>
                </Box>
                <Box>
                  Троечников (3):
                  <strong>{counters[3]}</strong>
                </Box>
                <Box>
                  Двоечников (2):
                  <strong>{counters[2]}</strong>
                </Box>
                <Box>
                  Без оценок:
                  <strong>{counters.none}</strong>
                </Box>
              </Box>
            );
          })()}
        </Box>
      )}

      <Button variant="contained" sx={{ mt: 2 }} onClick={saveGrades}>
        Сохранить
      </Button>
    </Box>
  );
}

export default TeacherGradebookJournal;
