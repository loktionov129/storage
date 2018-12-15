import React from 'react';

function Form({ onSubmit }) {
  let input;

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit({ title: input.value });
    input.value = '';
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <input className="form-control form-control-sm" ref={element => input = element} />
        <span className="input-group-btn">
          <button className="btn btn-secondary" type="submit">Добавить</button>
        </span>
      </div>
    </form>
  );
}

export default Form;
