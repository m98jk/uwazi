import React, { Component, PropTypes } from 'react'
import ConfigInputField from './configFields/ConfigInputField.js'
import TemplatesList from './TemplatesList.js'
import fetch from 'isomorphic-fetch'

class FormCreator extends Component {

  static contextTypes = {
    getInitialData: PropTypes.func
  }

  static requestState() {
    return fetch('http://localhost:3000/api/templates')
      .then((response) => response.json())
      .then((response) => {
        return response.rows;
      });
  }

  constructor (props, context) {
    super(props, context);
    this.fetch = props.fetch || fetch;

    if (!context.getInitialData(this)) {
      FormCreator.requestState()
      .then(templates => {
        this.setState({ templates: templates });
      });
    }

    this.state = {
      template: {name:'template name', fields: [{type:'input', label:'Short text', required: true}, {type:'select', label:'Dropdown', required: false}]},
      templates: context.getInitialData(this)
    };
  }

  addInput = () => {
    this.state.template.fields.push({type:'input', label:'Short text', required: false});
    this.setState(this.state);
  }

  save = (e) => {
    e.preventDefault();
    return this.fetch('/api/templates', {method:'POST',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 credentials: 'same-origin',
                 body: JSON.stringify(this.state)})
      .then((response) => {
        this.setState({error: response.status !== 200})
      }
    );
  }

  remove = (index) => {
    this.state.template.fields.splice(index, 1);
    this.setState(this.state);
  }

  update = (index, field) => {
    this.state.template.fields[index] = field;
    this.setState(this.state);
  }

  render = () => {
    return (
      <div>
        <h1>Form Creator!</h1>
        <div className="row">
          <div className="col-xs-2">
            <a className="btn btn-primary glyphicon glyphicon-plus" onClick={this.addInput}> Add field</a>
            <TemplatesList templates={this.state.templates}/>
          </div>
          <div className="col-xs-8">
            <form className="form-horizontal" onSubmit={this.save}>
                {this.state.template.fields.map((field, index) => {
                  return <ConfigInputField remove={this.remove.bind(this,index)} update={this.update.bind(this,index)} field={field} key={index} />
                })}
              <button type="submit" className="btn btn-default">Save !</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

}
export default FormCreator;
