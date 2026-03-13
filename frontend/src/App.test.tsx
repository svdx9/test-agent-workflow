import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the hello tailwind message', () => {
    render(() => <App />);
    const text = screen.getByText(/Hello tailwind!/i);
    expect(text).toBeInTheDocument();
  });
});
