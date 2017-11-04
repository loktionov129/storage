import * as React from 'react';
import './App.scss';
import Loggable from './loggable';

export interface AppProps {
  children?: any;
  title?: string;
}

@Loggable({
  displayTime: true,
  enable: true,
  locale: 'ru'
})
class Main extends React.Component<AppProps, {}> {

  render() {
    return (
      <div className='App'>
        <h1>{this.props.title}</h1>
        {this.props.children}
      </div>
    );
  }
}

const App = () => (<Main title='Welcome to React world!' />);
export default App;
