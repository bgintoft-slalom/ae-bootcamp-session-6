import { isOverdue } from '../todoStatus';

describe('isOverdue', () => {
  const referenceDate = new Date('2026-08-17T12:00:00');

  it('returns true for a past due date on an incomplete todo', () => {
    const todo = { dueDate: '2026-08-16', completed: 0 };
    expect(isOverdue(todo, referenceDate)).toBe(true);
  });

  it('returns false for a past due date on a completed todo', () => {
    const todo = { dueDate: '2026-08-16', completed: 1 };
    expect(isOverdue(todo, referenceDate)).toBe(false);
  });

  it('returns false for a due date of today', () => {
    const todo = { dueDate: '2026-08-17', completed: 0 };
    expect(isOverdue(todo, referenceDate)).toBe(false);
  });

  it('returns false for a future due date', () => {
    const todo = { dueDate: '2026-08-18', completed: 0 };
    expect(isOverdue(todo, referenceDate)).toBe(false);
  });

  it('returns false when there is no due date', () => {
    const todo = { dueDate: null, completed: 0 };
    expect(isOverdue(todo, referenceDate)).toBe(false);
  });

  it('returns false for a malformed due date instead of throwing', () => {
    const todo = { dueDate: 'not-a-date', completed: 0 };
    expect(() => isOverdue(todo, referenceDate)).not.toThrow();
    expect(isOverdue(todo, referenceDate)).toBe(false);
  });
});
