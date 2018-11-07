import React, { Component } from 'react';
import PropTypes from 'prop-types'; // $ npm i --save prop-types

class Hero extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    
    text: PropTypes.string.isRequired,
    
    optionalEnum: PropTypes.oneOf(['News', 'Photos']),
    
    optionalObjectWithShape: PropTypes.shape({
      color: PropTypes.string,
      fontSize: PropTypes.number
    }),
    
    requiredArrayOf: PropTypes.arrayOf(
      PropTypes.shape({
        color: PropTypes.string,
        fontSize: PropTypes.number
      })
    ).isRequired
  };
  render() {
    return (
      <div>
        <h1>{this.props['title']}</h1>
        <p>{this.props['text']}</p>
      </div>
    );
  }
}
