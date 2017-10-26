class FormSimple extends React.Component {
	constructor(props) {
  	super(props);
    this.state = {inputValue: ''};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }
  
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <p><input type="text" defaultValue="asdfg" /></p>
        <p>
          <input type="text" value={this.state.inputValue} placeholder="123456"
            onChange={this.handleInputChange}
          />
        </p>
        <select defaultValue={this.props.params.selectDefaultValue}>
          {this.props.params.selectOptions.map((option, index) => (
          	<option value={option} key={index}>{option}</option>
          ))}
        </select>
        <input type="checkbox" defaultChecked={this.props.params.checkboxDefaultChecked} />
        <input type="radio" defaultChecked={this.props.params.radioDefaultChecked} />
        <button type="submit">send</button>
      </form>
    );
  }
  
  handleSubmit(event) {
  	event.preventDefault();
  	console.warn(this);
  }
  
  handleInputChange(event) {
  	this.setState({inputValue: event.target.value});
    /* this.setState((prevState, props) => ({
      counter: prevState.counter + props.increment
    })); */
  }
}

const params = {
	selectOptions: ['nsk', 'krsk', 'spb', 'msk'],
	selectDefaultValue: 'krsk',
  checkboxDefaultChecked: true,
  radioDefaultChecked: true
};
ReactDOM.render(
  <FormSimple params={params} />,
  document.getElementById('container')
);
