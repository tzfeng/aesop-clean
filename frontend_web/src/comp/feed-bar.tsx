/* tslint:disable */
import * as React from 'react';
import './feed-bar.css';
// import './button.css';

interface IProps {
  for_staked: number;
  against_staked: number;
}

interface IState {
  content: any;
}

export class FeedBar extends React.Component<IProps, IState> {

  state: IState = {
    content: <div></div>,
  };

  constructor(props: IProps, state: IState) {
    super(props);
  }

  componentWillMount() {
    let total_len = this.props.for_staked + this.props.against_staked;
    let for_len = this.props.for_staked/total_len * 325;
    let against_len = this.props.against_staked/total_len * 325;

    this.setState({content : 
    <div className="feed-outer-bar">
      <div className="feed-left-bar" style={{width: for_len + "px"}}>
      </div>
      <div className="feed-right-bar" style={{width: against_len + "px"}}>
      </div>
    </div>
  });
  }

  public render() {
  	return(
  		<div>
  		{this.state.content}
  		</div>
  	);
  }
}