import React, { useEffect, useState } from 'react';
import TodoCard from './TodoCard';

function TodoList({ todos, onToggle, onEdit, onDelete, isLoading }) {
  // Forces periodic re-render so overdue status stays current purely from elapsed time (FR-007).
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (todos.length === 0) {
    return (
      <div className="todo-list empty-state">
        <p className="empty-state-message">
          No todos yet. Add one to get started! 👻
        </p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

export default TodoList;
