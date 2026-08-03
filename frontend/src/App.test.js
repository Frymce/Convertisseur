import { render, screen } from '@testing-library/react';
import App from './App';

test('renders application headline', () => {
  render(<App />);

  const title = screen.getByText(/Convert your photos with/i);

  expect(title).toBeInTheDocument();
});
