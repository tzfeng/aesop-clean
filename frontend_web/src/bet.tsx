/* tslint:disable */
export {};
import arrayMutators from 'final-form-arrays';
import { Component } from 'react';
import { client } from 'ontology-dapi';
import * as React from 'react';
import { Field, Form } from 'react-final-form';
import { RouterProps } from 'react-router';
import './css/button.css';
import './css/bet.css';
import { CONST, CONTRACT_HASH, SERVER, convertValue } from './utils';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BetState {
  date: any;
}

export class Bet extends Component<RouterProps, BetState> {

  state: BetState = {
    date: ""
  };

  constructor(props: RouterProps, state: BetState) {
    super(props);

    this.handleDate = this.handleDate.bind(this);
    this.onBet = this.onBet.bind(this);
    this.onBack = this.onBack.bind(this);
  }

  async onBet(values: any) {

    let endDate = this.state.date.getFullYear() + '-' + (this.state.date.getMonth() + 1) + '-' + this.state.date.getDate();  
    console.log(endDate);

    console.log(JSON.stringify(values));

    // gets account

    const scriptHash = CONTRACT_HASH;
    const operation = 'create_bet';
    const gasPrice = 500;
    const gasLimit = 60000;
    const requireIdentity: boolean = false;

    const account = await client.api.asset.getAccount();

    const url = SERVER + 'scrapes';

    // get price from backend
    var json_arr: any = {};
    json_arr["ticker"] = values.ticker;
    var json_string = JSON.stringify(json_arr);
    console.log(json_string);

    try {
    var resp = await fetch(url, {
                method: 'PUT',
                headers: new Headers({'content-type': 'application/json'}),
                body:  json_string }); 
    var init_price = await resp.json();
    console.log("init_price " + JSON.stringify(init_price));
    }
    catch (e) {
      console.log(e);
    }

    const parameters: any[] = [
          { type: 'String', value: account },
          { type: 'Integer', value: Number(values.amount_staked)*CONST },
          { type: 'String', value: values.ticker },
          { type: 'Integer', value: Number(values.sign) },
          { type: 'Integer', value: Number(values.margin) },
          { type: 'String', value: endDate },
          { type: 'Integer', value: Number(init_price)*CONST },
          ];
    const args = parameters.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
    
    console.log(JSON.stringify(args));

     try {
      var result = await client.api.smartContract.invoke({
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
        var json_string = JSON.stringify(json_arr);
        console.log(json_string);

        let url2 = SERVER + "bets";

        // calls backend
        try {
        var resp = await fetch(url2, {
                    method: 'POST',
                    headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
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

  onBack() {
    this.props.history.goBack();
  }

  handleDate(changedDate: any) {

    this.setState({
      date: changedDate
    });

  }

  render() {
  return (
    <div>
        <h1>Create a New Insight</h1>
        <div className="bet-box">
        <Form
        initialValues={{
          amount_staked: 1,
          ticker: "FB",
          margin: 1,
          sign: 1
        }}
        mutators={Object.assign({}, arrayMutators) as any}
        onSubmit={this.onBet}
        render={({
          form,
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit}>         
          <h4>Total AES staked on insight:</h4>
          <Field name="amount_staked" className="field-bar-large coin" component="input" />
          <h4>Enter insight</h4>
          <Field name="ticker" className="field-bar" component="input" />
          <h4>Margin</h4>
          <Field name="margin" className="field-bar" component="input" />       
          <div className="float-left"><button className="back-button" type="button" onClick={() => { form.change("sign", "1"); }}>{'\u2191'}</button></div>
          <div className="float-right"><button className="back-button" type="button" onClick={() => { form.change("sign", "-1"); }}>{'\u2193'}</button></div>

          <h4>Date</h4>
          <DatePicker dateFormat="yyyy/MM/dd" selected={this.state.date} onChange={this.handleDate} 
          placeholderText="Set Insight Expiry Date" withPortal/>
          <br />
          <br />
          <button className="sec-button" type="submit">Submit</button>
          </form>
        )}
      />
      <button onClick={this.onBack} className="back-button">&lt;</button>
    </div>
    </div>
      );
    }
};
