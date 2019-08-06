/* tslint:disable */
import * as React from 'react';
// import * as ReactModal from 'react-modal';
import './css/feed-box.css';
import './css/button.css';
import './css/modal.css';
import { VoteBet } from './voteBet';
import { FeedBar } from './comp/feed-bar';
import * as ReactModal from 'react-modal';
// import { Overlay, Button } from 'react-bootstrap';

// green: rgb(27, 199, 115)
// red: rgb(183, 75, 107)

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

interface IBoxState {
  showModal: any;
  style:any;
}

export class FeedBox extends React.Component<IBoxProps, IBoxState> {

  state: IBoxState = {
    showModal: false,
    style: { color: 'rgb(27, 199, 115)' },
  };

  constructor(props: IBoxProps, state: IBoxState) {
    super(props);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal(e: any) {
    e.stopPropagation();
    this.setState({ showModal: false });
  }

  round(num: number) {
    return Math.round(num * 100) / 100;
  }

  componentWillMount() {
    if (this.props.change < 0) this.setState({style: { color: 'rgb(183, 75, 107)' }});
  }

  public render() {

    let curr_price = this.round(this.props.target_price/(1 + this.props.change/100));

    const modalStyles = {overlay: {backgroundColor: 'var(--lightGrey)', height: '90vh', margin:'0 auto', width:'500px'}};

    return(
    <div>
    

    <div onClick={this.handleOpenModal}>
    <div className="feed-box" style={this.state.style}>  
    <div className="feed-for-left"><h3>Volume: {this.props.for_staked + this.props.against_staked}</h3></div>
    <div className="feed-for-right">Current price: {curr_price}</div>  
    

    <div className="main-line">{this.props.ticker} will <span style={this.state.style}>{this.props.change}%</span> to {this.props.target_price}</div>
    <FeedBar for_staked={this.props.for_staked} against_staked={this.props.against_staked} />
    <div className="feed-for-left">{this.props.for_staked*100/(this.props.for_staked+this.props.against_staked)}% Yes</div>
    <div className="feed-for-right">{this.props.against_staked*100/(this.props.for_staked+this.props.against_staked)}% No</div>
    <h6> By {this.props.date}</h6>
    </div>

     <ReactModal
           isOpen={this.state.showModal}
           contentLabel="Minimal Modal Example"
           className="Modal"
           ariaHideApp={false}
           onRequestClose={this.handleCloseModal}
           shouldCloseOnOverlayClick={true}
           style={ modalStyles }
         >

          <div className="details-header">
          <h1><button className="back-button" onClick={this.handleCloseModal}>&lt;</button>Insight Details</h1>
          <h3>{this.props.ticker}</h3>
          </div>

              <div className="feed-box-after">
              <h3>Volume: {this.props.for_staked + this.props.against_staked}</h3>
              <div className="main-line">{this.props.ticker} will <span style={this.state.style}>{this.props.change}%</span> to {this.props.target_price}</div>
              <FeedBar for_staked={this.props.for_staked} against_staked={this.props.against_staked} />
              <div className="feed-for-left">{this.props.for_staked*100/(this.props.for_staked+this.props.against_staked)}% Yes</div>
              <div className="feed-for-right">{this.props.against_staked*100/(this.props.for_staked+this.props.against_staked)}% No</div>    
     <div className="volume-bubble-left">Avg Rep Yes<br/> <b>{this.props.for_rep} AES</b></div>
     <div className="volume-bubble-right">Avg Rep No<br/> <b>{this.props.against_rep} AES</b></div>
     <VoteBet betId = {this.props.id} />
     <br />
     <h6> By {this.props.date}</h6>
     </div>

     </ReactModal>
     </div>
    </div>


    
    );
  }
}

// <button className="back-button" onClick={this.handleOpenModal}>view more</button>
//     <ReactModal
//            isOpen={this.state.showModal}
//            contentLabel="Minimal Modal Example"
//            className="Modal"
//          >
//         <div className="modal-content-div">
//         <VoteBet betId = {this.props.id} />
//         <button className="back-button" onClick={this.handleCloseModal}>back</button>
//         </div>
//         </ReactModal>

