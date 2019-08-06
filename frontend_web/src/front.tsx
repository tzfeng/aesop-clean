/* tslint:disable */
import { Component } from 'react';
import { RouterProps } from 'react-router';
import * as React from 'react';
import './css/front.css';
import './css/button.css';

export class Front extends Component<RouterProps, {}> {
	render() {
	  return (
	  	<div className="front-body">
	  	<br/><br/>
	  	<img src={require('./icons/aesopMascot.png')} />
	  	<h2>Aesop</h2>
	  	<h3>Decentralised financial insights<br/>
	  	 at your fingertips.</h3>
	  	 <br/><br/>
	  	 <a href="./createUser"><button className="main-button white-button">Log In</button></a>
	  	 <br/>
	  	 Are you new? <a href="./createUser"><b>Create account</b></a>
	  	</div>
	  );
	}
};