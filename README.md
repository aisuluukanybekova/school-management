# School Management System

Web-приложение для управления школой: учёт учеников, преподавателей, предметов, классов, посещаемости и оценок.

---

## Возможности

- 👤 **Роли пользователей**: Администратор, Учитель, Ученик
- **Админ-панель**:
  - Добавление/удаление учеников и преподавателей
  - Управление классами и предметами
  - Настройка четвертей (семестров)
- **Преподаватель**:
  - Отметка посещаемости
  - Выставление оценок по четвертям
- **Ученик**:
  - Просмотр оценок
  - Просмотр посещаемости

---

## Технологии

**Frontend**:
-  React.js
-  Redux Toolkit
-  Material UI
-  Axios

**Backend**:
- Node.js + Express.js
- MongoDB + Mongoose


## 🧑‍💻 Установка

```bash
# Клонируй репозиторий
git clone https://github.com/aisuluukanybekova/school-management-system.git
cd school-management-system

# Установка зависимостей
cd backend && npm install
cd ../frontend && npm install

# Запуск сервера
cd backend && npm run dev

# Запуск клиента
cd frontend && npm start
