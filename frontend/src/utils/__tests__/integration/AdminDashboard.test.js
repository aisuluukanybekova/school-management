// src/utils/__tests__/integration/AdminDashboard.test.js
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AdminDashboard from '../../../pages/admin/AdminDashboard';

const mockStore = configureStore([]);
const store = mockStore({
  user: {
    currentUser: { name: 'Admin Tester' },
  },
});

describe('AdminDashboard integration routing', () => {
  test('renders AdminHomePage by default route "/"', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/*" element={<AdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/ученики/i)).toBeInTheDocument(); // точный элемент из AdminHomePage
  });

  test('redirects to AdminHomePage on unmatched route', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/non-existent']}>
          <Routes>
            <Route path="/*" element={<AdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/ученики/i)).toBeInTheDocument();
  });

  test('renders AdminProfile route', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/Admin/profile']}>
          <Routes>
            <Route path="/*" element={<AdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    // Только если в AdminProfile добавишь data-testid
    expect(screen.getByTestId('admin-profile-title')).toBeInTheDocument();
  });
});
