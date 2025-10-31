import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BreathingCircle from '@/components/practice/BreathingCircle';

describe('BreathingCircle Component', () => {
  it('renders breathing circle with correct initial state', () => {
    render(<BreathingCircle isActive={false} />);
    
    const circle = screen.getByTestId('breathing-circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveStyle('transform: scale(1)');
  });

  it('starts animation when isActive is true', async () => {
    render(<BreathingCircle isActive={true} />);
    
    const circle = screen.getByTestId('breathing-circle');
    
    // Wait for animation to start
    await waitFor(() => {
      expect(circle).not.toHaveStyle('transform: scale(1)');
    }, { timeout: 2000 });
  });

  it('displays correct phase text', () => {
    render(<BreathingCircle isActive={true} />);
    
    expect(screen.getByText('Breathe In')).toBeInTheDocument();
  });
});