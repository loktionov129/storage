import * as React from 'react';

export interface LoggableParams {
  displayTime?: boolean;
  enable?: boolean;
  locale?: string;
}

const Loggable = ({displayTime = true, enable = false, locale = 'ru'}: LoggableParams) => (Comp: any) => {
  if (!enable) {
    return Comp;
  }

  const childName = Comp.displayName || Comp.name;
  const getTime = () => {
    const options = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    };
    return (new Date()).toLocaleString(locale, options);
  };

  return class extends React.Component<any, any> {
    static displayName = `Loggable(${childName})`;

    render() {
      return <Comp {...this.props} />;
    }

    componentDidMount() {
      const time = displayTime ? `[${getTime()}] ` : '';
      console.warn(`${time}${childName}::componentDidMount()`);
    }

    componentWillUnmount() {
      const time = displayTime ? `[${getTime()}] ` : '';
      console.warn(`${time}${childName}::componentWillUnmount()`);
    }
  };
};

export default Loggable;
