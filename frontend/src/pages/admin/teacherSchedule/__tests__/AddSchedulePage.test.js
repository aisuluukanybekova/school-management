import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import AddSchedulePage from '../AddSchedulePage';
import configureStore from 'redux-mock-store';

// ✅ Сначала создаём mockAxios
const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { message: 'OK' } })),
  create: jest.fn(function () {
    return mockAxios;
  }),
};

// ✅ Потом мокаем
jest.mock('axios', () => mockAxios);

const mockStore = configureStore([]);
const store = mockStore({
  user: {
    currentUser: {
      schoolId: 'mockSchoolId',
    },
  },
});

describe('AddSchedulePage', () => {
  it('должен отобразить заголовок', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <AddSchedulePage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/создание расписания/i)).toBeInTheDocument();
  });

  it('должен отобразить кнопку "Сгенерировать"', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <AddSchedulePage />
        </BrowserRouter>
      </Provider>
    );

    const button = screen.getByRole('button', { name: /сгенерировать/i });
    expect(button).toBeInTheDocument();
  });

  it('должен показать предупреждение, если не выбран класс', () => {
    window.alert = jest.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <AddSchedulePage />
        </BrowserRouter>
      </Provider>
    );

    const generateButton = screen.getByRole('button', { name: /сгенерировать/i });
    fireEvent.click(generateButton);
    expect(window.alert).toHaveBeenCalledWith('Выберите класс и день!');
  });
});
