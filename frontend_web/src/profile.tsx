/* tslint:disable */
export {};
import * as React from 'react';
import { RouterProps } from 'react-router';
import './css/profile.css';
import './css/button.css';
import { rep } from './rep';
import { getFeed } from './feed-util';

interface ProfState {
  acc: string;
  toDisplay: any;
  history: any;
}

export class Profile extends React.Component<RouterProps, ProfState> {

  state: ProfState = {
    acc: "",
    toDisplay: <div></div>,
    history: <div></div>
  };

  constructor(props: RouterProps, state: ProfState) {
    super(props);
    this.viewRec = this.viewRec.bind(this);
    this.login = this.login.bind(this);
  }

  login() {
    this.props.history.push('/');
  }

  async componentWillMount() {
    try { 
      var repInfo: any | number[] = await rep();
      console.log(repInfo);
      if ((repInfo == -1) || (repInfo == undefined)) { alert("Please log into an account."); this.login(); }
    }
    catch (e) {
      console.log(e);
      var repInfo: any | number[]  = [-1, -1, -1];
    }


    this.setState({toDisplay:
            <ul>
            <li><h3>{'My reputation: '}</h3> <h4>{repInfo[0]}</h4></li>
            <li><h3>{'Total Tokens: '}</h3> <h4>{Math.round(repInfo[1])}</h4></li>
            <li><h3>{'Total Wallet: '}</h3> <h4>{Math.round(repInfo[2])}</h4></li>
            </ul>
          });
  }

  async viewRec() {

    let content = await getFeed('payouts');

    this.setState({
                     history : content       
    });
  }

  render() {
    return (
    <div>
    <div className="bg-rect">
    <div className="corner-circle"></div>
                <div className="profile-box">
                  <h1>Profile</h1>
                  <div className="profile-main">
                  <div>{this.state.toDisplay || 'Unknown'}</div>
                  </div>

                  <button onClick={this.viewRec} className="profile-button">View History >> </button>
                  <a href="/exch"><button className="profile-button">Exchange tokens >> </button></a>      
                  <div>{<ul>{this.state.history}</ul> || 'Unknown'}</div>
                </div>
    </div>
    </div>
    );
  }
}
