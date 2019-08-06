/* tslint:disable */
import { client } from 'ontology-dapi';
import arrayMutators from 'final-form-arrays';
import * as React from 'react';
import { Component } from 'react';
import { Field, Form } from 'react-final-form';
import './css/button.css';
import { CONST, CONTRACT_HASH, SERVER, convertValue } from './utils';
import './css/modal.css';
import './css/vote.css';

interface BetProps {
  betId: string;
}

interface VoteState {
  lol: any;
  showModal: boolean;
  vote: boolean;
}

// tslint:disable:max-line-length
// args: betId, userAddress, how much stake, for_against
export class VoteBet extends Component<BetProps, VoteState> {

  state: VoteState = {
    lol: <div>hasnt worked</div>,
    showModal: false,
    vote: false
  };

  props: BetProps = {
    betId: this.props.betId
  };

  constructor(props: BetProps, state: VoteState) {
    super(props);

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onVote = this.onVote.bind(this);
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }


  async onVote(values: any) {

    console.log(JSON.stringify(values));

    try {
      var account: string = await client.api.asset.getAccount();
    }
    catch (e) {
      throw e;
    }

    const scriptHash: string = CONTRACT_HASH;
    const operation: string = 'vote';
    const gasPrice: number = 500;
    const gasLimit: number = 100000000;
    const requireIdentity: boolean = false;

    const parameters: any[] = [
          { type: 'Integer', value: this.props.betId },
          { type: 'String', value: account },
          { type: 'Integer', value: Number(values.amount_staked) * CONST },
          { type: 'Boolean', value: (values.for_against==='true') }];

    const args = parameters.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));

    console.log(JSON.stringify(args));

    try {
      const result = await client.api.smartContract.invoke({
        scriptHash,
        operation,
        args,
        gasPrice,
        gasLimit,
        requireIdentity
      });
      // tslint:disable-next-line:no-console
      console.log('onScCall finished, result:' + JSON.stringify(result));

        var txn = result['transaction'];

        var json_arr: any = {};
        json_arr["txn"] = txn;
        json_arr["_id"] = this.props.betId;
        var json_string = JSON.stringify(json_arr);
        console.log(json_string);

        let url = SERVER + 'vote';

        // calls backend
        try {
        var resp = await fetch(url, {
                    method: 'PUT',
                    headers: new Headers({'content-type': 'application/json'}),
                    body:  json_string }); 
        var data = await resp.json();
        console.log(JSON.stringify(data));
        }
        catch (e) {
          console.log(e);
       }

    } catch (e) {
      alert('onScCall cancelled');
      // tslint:disable-next-line:no-console
      console.log('onScCall error:', e);
    }   
  }

  onYes() {
    this.setState({ vote: true });
  }

  async onNo() {
    this.setState({ vote: false });
  }

  render() {
    console.log("votebet " + this.props.betId);
    return (
      <div>
      <Form
        initialValues={{
          amount_staked: 1,
          for_against:true
        }}
        mutators={Object.assign({}, arrayMutators) as any}
        onSubmit={this.onVote}
        render={({
          form,
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit}>
          <div className="centered"><Field name="amount_staked" className="field-bar-large coin" component="input" /></div>
          <br />
          <div className="feed-for-left"><button className="main-button" type="submit" onClick={() => { form.change("for_against", "true"); }}>Vote Yes</button></div>
          <div className="feed-for-right"><button className="main-button" type="submit" onClick={() => { form.change("for_against", "false"); }}>Vote No</button></div>
          </form>
        )}
      />

      </div>
     
    );
  }
}
