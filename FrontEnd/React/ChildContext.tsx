import * as React from 'react';
import * as PropTypes from 'prop-types';

const userPropTypes = {
  age: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired
};
class Main extends React.Component<{}, {}> {
  static childContextTypes = {
    user: PropTypes.shape(userPropTypes).isRequired
  };

  getChildContext() {
    return {
      user: { age: 22, name: 'Alex' }
    };
  }

  render() {
    return <Parent />;
  }
}

class Parent extends React.Component {
  render() {
    return <Child />;
  }
}

class Child extends React.Component {
  static contextTypes = {
    user: PropTypes.shape(userPropTypes).isRequired
  };

  render() {
    const { age, name } = this.context.user;
    return <p>Hello {name}({age})!</p>;
  }
}
const App = () => (<Main />);
export default App;
export { userPropTypes };
