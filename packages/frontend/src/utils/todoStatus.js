/**
 * Determine whether a todo is overdue: has a due date strictly before the
 * start of the reference day, and is not marked complete.
 * @param {{ dueDate?: string|null, completed?: number|boolean }} todo
 * @param {Date} [referenceDate] - defaults to now; injectable for testing
 * @returns {boolean}
 */
function isOverdue(todo, referenceDate = new Date()) {
  if (!todo || !todo.dueDate || todo.completed === 1 || todo.completed === true) {
    return false;
  }

  const dueDate = new Date(todo.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const startOfDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const startOfReferenceDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  return startOfDueDate < startOfReferenceDate;
}

export { isOverdue };
