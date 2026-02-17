import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ONPPROD title', () => {
  render(<App />);
  const titleElement = screen.getByText(/onpprod/i);
  expect(titleElement).toBeInTheDocument();
});
