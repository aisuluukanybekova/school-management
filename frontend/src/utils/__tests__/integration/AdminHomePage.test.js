// src/utils/__tests__/integration/AdminHomePage.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AdminHomePage from '../../../pages/admin/AdminHomePage';

const mockStore = configureStore([]);

const mockData = {
  user: { currentUser: { _id: 'admin123' } },
  student: { studentsList: new Array(10).fill({}) },
  sclass: { sclassesList: new Array(5).fill({}) },
  teacher: { teachersList: new Array(3).fill({}) },
};

describe('AdminHomePage UI', () => {
  test('renders student, class, and teacher statistics', () => {
    const store = mockStore(mockData);

    render(
      <Provider store={store}>
        <AdminHomePage />
      </Provider>,
    );

    expect(screen.getByText(/ученики/i)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();

    expect(screen.getByText(/классы/i)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();

    expect(screen.getByText(/учителя/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  test('renders SeeNotice component', () => {
    const store = mockStore(mockData);

    render(
      <Provider store={store}>
        <AdminHomePage />
      </Provider>,
    );

    // Только если добавишь data-testid="see-notice" в SeeNotice.js
    expect(screen.getByTestId('see-notice')).toBeInTheDocument();
  });
});
