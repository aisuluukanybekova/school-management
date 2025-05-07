import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewSubject = () => {
  const { subjectID } = useParams(); // из маршрута /subjects/subject/:subjectID
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/subjects/${subjectID}/with-topics`); // <-- исправлено
        setSubject(res.data.subject);
        setTopics(res.data.topics);
      } catch (err) {
        console.error("Ошибка загрузки данных", err);
        setError('Не удалось загрузить предмет или темы');
      }
    };

    if (subjectID) fetchData();
  }, [subjectID]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!subject) return <p>Загрузка...</p>;

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">📘 {subject.subName}</h2>
      <p><strong>Класс:</strong> {subject.sclassName?.sclassName}</p>
      <p><strong>Учитель:</strong> {subject.teacher?.name}</p>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold mb-2">📚 Темы занятий:</h3>
      {topics.length ? (
        <ul className="list-disc list-inside space-y-1">
          {topics.map((t, idx) => (
            <li key={idx}>
              <strong>{t.day} {t.startTime}:</strong> {t.topic}
              {t.homework && (
                <span className="text-sm text-gray-600"> — домашка: {t.homework}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Темы пока не добавлены.</p>
      )}
    </div>
  );
};

export default ViewSubject;
