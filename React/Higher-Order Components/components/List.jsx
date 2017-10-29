import React from 'react';

function List({ todos, onToggle, onRemove }) {
  return (
    <div className="todo-list list-group">
      {todos.map(todo =>
        <div className="todo list-group-item justify-content-between" key={todo.id}>
          <label>
            <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
            {todo.title}
          </label>
          <button className="btn btn-primary btn-sm" onClick={() => onRemove(todo.id)}>Удалить</button>
        </div>
      )}
    </div>
  );
}

export default List;
