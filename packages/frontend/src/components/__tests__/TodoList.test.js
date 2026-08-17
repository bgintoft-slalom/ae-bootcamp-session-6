import React from 'react';
import { render, screen, act } from '@testing-library/react';
import TodoList from '../TodoList';

describe('TodoList Component', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  const mockTodos = [
    {
      id: 1,
      title: 'Todo 1',
      dueDate: '2025-12-25',
      completed: 0,
      createdAt: '2025-11-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Todo 2',
      dueDate: null,
      completed: 1,
      createdAt: '2025-11-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when todos array is empty', () => {
    render(<TodoList todos={[]} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText(/No todos yet. Add one to get started!/)).toBeInTheDocument();
  });

  it('should render all todos when provided', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  it('should render correct number of todo cards', () => {
    const { container } = render(
      <TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />
    );
    
    const cards = container.querySelectorAll('.todo-card');
    expect(cards).toHaveLength(2);
  });

  it('should pass handlers to TodoCard components', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    // Verify that edit buttons exist for each todo
    expect(screen.getAllByLabelText(/Edit/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Delete/)).toHaveLength(2);
  });

  describe('Periodic overdue re-check', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should re-render at least once per minute so overdue status stays current', () => {
      const referenceNow = new Date();
      const todayIso = referenceNow.toISOString().split('T')[0];
      const todoDueToday = [
        {
          id: 3,
          title: 'Due today todo',
          dueDate: todayIso,
          completed: 0,
          createdAt: '2025-11-01T00:00:00Z'
        }
      ];

      render(<TodoList todos={todoDueToday} {...mockHandlers} isLoading={false} />);

      // Not yet overdue: due date is today, at the moment of the initial render.
      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();

      // Simulate the day rolling over then advance the periodic timer by >= 60s.
      jest.setSystemTime(new Date(referenceNow.getTime() + 24 * 60 * 60 * 1000));
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('should clear the interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { unmount } = render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });
});
