/* tslint:disable */
export {};
import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import { RouterProps } from 'react-router';
import './css/button.css';
import './css/index.css';
import { FeedBox } from './feed-box';
import './css/feed-box.css';
import './css/feed.css';
import { SERVER } from './utils';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import './css/circle.css';
import { rep } from './rep';
// import coin from './icons/coin.png';

const circleStyle: any = {
    root: {},
    path: {
      stroke: 'rgb(255, 199, 99)',
      strokeLinecap: 'round',
      transition: 'stroke-dashoffset 0.5s ease 0s',
      transform: 'rotate(0.75turn)',
      transformOrigin: 'center center',
    },
    // Customize the circle behind the path, i.e. the "total progress"
    trail: {
      stroke: 'rgb(74, 197, 90)',
      strokeLinecap: 'round',
      transform: 'rotate(0.75turn)',
      transformOrigin: 'center center',
    },
    // Customize the text
    text: {
      // // Text color
      // fill: '#f88',
      // // Text size
      // fontSize: '16px',
    },
    // Customize background - only used when the `background` prop is true
    background: {
      // fill: '#3e98c7',
    },
  }

interface FeedState {
  content: any;
  rep: number;
}

/* thing */
export class Feed extends React.Component<RouterProps, FeedState> {

  state: FeedState = {
    content: <div>loading</div>,
    rep: 50,
  };

  constructor(props: RouterProps, state: FeedState) {
    super(props);

    this.newBet = this.newBet.bind(this);
    this.onBack = this.onBack.bind(this);
    this.login = this.login.bind(this);
  }

  onBack() {
    this.props.history.goBack();
  }

  async componentWillMount() {

    var repInfo: any | number[] = await rep();
    console.log(repInfo);
    if (repInfo == undefined) { alert("Please log into an account."); this.login(); }
    if (repInfo == -1) { alert("Please log into an account."); this.login(); }

    let url = SERVER + "bets";

    let resp = await fetch(url, {
                method: 'GET',
                headers: new Headers()});
    let data = await resp.json();

    let all = []

   for (let bet of data) {

      let x = <li key={bet['_id']}><FeedBox against_rep={bet['against_avg_rep']}
      against_staked={bet['against_staked']}
      change={bet['change']}
      createdAt={bet['createdAt']}
      for_rep={bet['for_avg_rep']}
      for_staked={bet['for_staked']}
      prob={bet['prob']}
      date={bet['date']}
      sector={bet['sector']}
      target_price={bet['target_price']}
      ticker={bet['ticker']}
      id={bet['_id']} /></li>;

      all.push(x);    
    }

  
      this.setState({
              content : all,
              rep: repInfo[0]     
      })
    
    
  }

  // clickToBet(value: number) {
  //   const url = '/bet/' + value.toString();
  //   this.props.history.push(url);
  // }

  newBet() {
    this.props.history.push('/bet');
  }

  login() {
    this.props.history.push('/');
  }

  render() {
    const val = this.state.rep;

  return (
    <div>
        <div className="bg-rect-prim">
        <div className="corner-circle"></div>
        </div>
        
      <div className="feed-container"> 
      <div className="rep-box"> 
      <CircularProgressbarWithChildren value={val} circleRatio={0.5} maxValue={300} styles={circleStyle}>
        <img src={require('./icons/coin.png')} />
        <h6>My reputation:</h6>
        <h2>{this.state.rep}</h2>
        <button onClick={this.newBet} className="main-button">Create New Insight</button>
      </CircularProgressbarWithChildren>    
      </div>
      <div className="feed-white">   
      <h5>Latest Insights</h5> 
        <div><ul>{this.state.content}</ul></div> 
        <br />
        <button onClick={this.onBack} className="back-button">&lt;</button>
      </div>
      <br />
      <br />
      <br />
      </div>
    </div>
  );
  }
};
// <button onClick={() => clickVote(1)} className="bet-button">bet 1</button>
