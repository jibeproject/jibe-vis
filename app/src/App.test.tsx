import { render } from '@testing-library/react';
import { expect } from 'vitest'
import App from './App';

test("Renders the main page", () => {
  render(<App />)
  expect(true).toBeTruthy()
})