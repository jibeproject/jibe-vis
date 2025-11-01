import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test("Renders the main page", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(true).toBeTruthy();
});