/* tslint:disable */

import * as React from 'react';
import { FeedBar } from './feed-bar';
import './feed-content.css';

interface IBoxProps {
  against_rep: any | number;
  against_staked: any | number;
  change: any | number;
  createdAt: any | string;
  for_rep: any | number;
  for_staked: any | number;
  prob: any | number;
  sector: any | string;
  target_price: any | number;
  ticker: any | string;
  id: any | number;
  date: any | string;
}

export class FeedContent extends React.Component<IBoxProps, {}> {

	public render() {
		return(
				<div className="feed-box">  
			    <h3>Volume: {this.props.for_staked + this.props.against_staked}</h3>
			    <h2>{this.props.ticker} will {this.props.change}% to {this.props.target_price}</h2>
			    <FeedBar for_staked={5} against_staked={40} />
			    <div className="feed-for-left">{this.props.for_rep}% Yes</div>
			    <div className="feed-for-right">{this.props.against_rep}% No</div>
			    <h6> By {this.props.date}</h6>
			    </div>
		);
	}
}