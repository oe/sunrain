import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PracticeCard from '@/components/practice/PracticeCard';
import PracticeFilters from '@/components/practice/PracticeFilters';
import BreathingCircle from '@/components/practice/BreathingCircle';
import PracticeTimer from '@/components/practice/PracticeTimer';
import type { PracticeType } from '@/types/practice';

// Mock data for testing
const mockPractice: PracticeType = {
  id: 'test-practice',
  name: 'Test Breathing Exercise',
  description: 'A test breathing exercise for unit testing',
  category: 'breathing',
  difficulty: 'beginner',
  defaultDuration: 5,
  minDuration: 3,
  maxDuration: 10,
  steps: [
    {
      id: 'step-1',
      title: 'Get Comfortable',
      description: 'Find a comfortable position',
      duration: 30,
      instructions: ['Sit or lie down comfortably'],
      tips: ['Keep your back straight']
    },
    {
      id: 'step-2',
      title: 'Breathe Deeply',
      description: 'Take deep breaths',
      duration: 60,
      instructions: ['Inhale slowly', 'Exhale slowly'],
      tips: ['Focus on your breath']
    }
  ],
  benefits: ['Reduces stress', 'Improves focus'],
  tags: ['breathing', 'relaxation', 'stress-relief'],
  localization: {
    en: {
      name: 'Test Breathing Exercise',
      description: 'A test breathing exercise for unit testing'
    }
  },
  customization: {
    duration: true,
    backgroundMusic: true,
    voiceGuidance: true
  }
};

const mockPractices: PracticeType[] = [
  mockPractice,
  {
    ...mockPractice,
    id: 'test-practice-2',
    name: 'Advanced Meditation',
    category: 'meditation',
    difficulty: 'advanced',
    defaultDuration: 15
  }
];

describe('PracticeCard Component', () => {
  it('renders practice information correctly', () => {
    render(<PracticeCard practice={mockPractice} />);
    
    expect(screen.getByText('Test Breathing Exercise')).toBeInTheDocument();
    expect(screen.getByText('A test breathing exercise for unit testing')).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('has correct link href for practice', () => {
    render(<PracticeCard practice={mockPractice} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/practice/test-practice/');
  });

  it('displays correct difficulty badge color', () => {
    render(<PracticeCard practice={mockPractice} />);
    
    const difficultyBadge = screen.getByText('Beginner');
    expect(difficultyBadge).toHaveClass('badge-success');
  });
});

describe('PracticeFilters Component', () => {
  const mockOnFilteredPractices = vi.fn();

  beforeEach(() => {
    mockOnFilteredPractices.mockClear();
  });

  it('renders search input and filter buttons', () => {
    render(
      <PracticeFilters 
        practices={mockPractices} 
        onFilteredPractices={mockOnFilteredPractices} 
      />
    );
    
    expect(screen.getByPlaceholderText('Search practices...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('filters practices by search term', async () => {
    render(
      <PracticeFilters 
        practices={mockPractices} 
        onFilteredPractices={mockOnFilteredPractices} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search practices...');
    fireEvent.change(searchInput, { target: { value: 'breathing' } });
    
    await waitFor(() => {
      expect(mockOnFilteredPractices).toHaveBeenCalledWith([mockPractice]);
    });
  });

  it('filters practices by category', async () => {
    render(
      <PracticeFilters 
        practices={mockPractices} 
        onFilteredPractices={mockOnFilteredPractices} 
      />
    );
    
    // Click filters button to show filter options
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Click meditation category
    const meditationButton = screen.getByText('Meditation');
    fireEvent.click(meditationButton);
    
    await waitFor(() => {
      expect(mockOnFilteredPractices).toHaveBeenCalledWith([mockPractices[1]]);
    });
  });

  it('filters practices by difficulty', async () => {
    render(
      <PracticeFilters 
        practices={mockPractices} 
        onFilteredPractices={mockOnFilteredPractices} 
      />
    );
    
    // Click filters button to show filter options
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Click advanced difficulty
    const advancedButton = screen.getByText('Advanced');
    fireEvent.click(advancedButton);
    
    await waitFor(() => {
      expect(mockOnFilteredPractices).toHaveBeenCalledWith([mockPractices[1]]);
    });
  });

  it('clears all filters when clear button is clicked', async () => {
    render(
      <PracticeFilters 
        practices={mockPractices} 
        onFilteredPractices={mockOnFilteredPractices} 
      />
    );
    
    // Apply a filter first
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const meditationButton = screen.getByText('Meditation');
    fireEvent.click(meditationButton);
    
    // Then clear filters
    const clearButton = screen.getByText('Clear all');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(mockOnFilteredPractices).toHaveBeenCalledWith(mockPractices);
    });
  });
});

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

describe('PracticeTimer Component', () => {
  it('renders timer with correct initial time', () => {
    render(<PracticeTimer duration={300} isActive={false} />);
    
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('starts counting down when isActive is true', async () => {
    render(<PracticeTimer duration={5} isActive={true} />);
    
    // Wait for timer to start
    await waitFor(() => {
      expect(screen.getByText('4:59')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('calls onComplete when timer reaches zero', async () => {
    const mockOnComplete = vi.fn();
    render(<PracticeTimer duration={1} isActive={true} onComplete={mockOnComplete} />);
    
    // Wait for timer to complete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('pauses timer when isPaused is true', async () => {
    const { rerender } = render(<PracticeTimer duration={10} isActive={true} isPaused={false} />);
    
    // Let it run for a bit
    await waitFor(() => {
      expect(screen.getByText('9:59')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    const timeBeforePause = screen.getByText('9:59').textContent;
    
    // Pause the timer
    rerender(<PracticeTimer duration={10} isActive={true} isPaused={true} />);
    
    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Time should not have changed
    expect(screen.getByText(timeBeforePause!)).toBeInTheDocument();
  });

  it('displays correct status text based on time remaining', () => {
    const { rerender } = render(<PracticeTimer duration={300} isActive={true} />);
    
    // Normal time
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    
    // Almost done
    rerender(<PracticeTimer duration={60} isActive={true} />);
    expect(screen.getByText('Almost done!')).toBeInTheDocument();
    
    // Completed
    rerender(<PracticeTimer duration={0} isActive={false} isCompleted={true} />);
    expect(screen.getByText('Completed!')).toBeInTheDocument();
  });
});

describe('Practice Integration Tests', () => {
  it('should handle practice selection flow', async () => {
    render(<PracticeCard practice={mockPractice} />);
    
    // Check that the link has correct href
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/practice/test-practice/');
    
    // Check that the link contains the correct text
    expect(link).toHaveTextContent('Start Practice');
  });

  it('should filter practices correctly with multiple criteria', async () => {
    const mockOnFilteredPractices = vi.fn();
    render(
      <PracticeFilters 
        practices={mockPractices} 
        onFilteredPractices={mockOnFilteredPractices} 
      />
    );
    
    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search practices...');
    fireEvent.change(searchInput, { target: { value: 'breathing' } });
    
    // Apply category filter
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const breathingButton = screen.getByText('Breathing');
    fireEvent.click(breathingButton);
    
    await waitFor(() => {
      expect(mockOnFilteredPractices).toHaveBeenCalledWith([mockPractice]);
    });
  });
});
