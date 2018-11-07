import React from 'react';

import Form from './components/Form';
import List from './components/List';
import withCrud from './hoc/withCrud';

function App({ data, create, update, remove }) {
    return (
      <div className="container">
        <Form onSubmit={create} />
        <List todos={data}
              onToggle={update}
              onRemove={remove} />
      </div>
    );
}

export default withCrud(App, 'api/todos');
