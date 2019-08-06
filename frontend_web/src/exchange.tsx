/* tslint:disable */
import { client } from 'ontology-dapi';
import * as React from 'react';
import { Component } from 'react';
import { CONST, CONTRACT_HASH, convertValue } from './utils';
import { RouterProps } from 'react-router';
import { Field, Form } from 'react-final-form';

// purchase_bank - ONG to AES
// redeem_bank is AES to ONG
export class Exchange extends Component<RouterProps, {}> {

	async onExch(values: any) {

    const scriptHash: string = CONTRACT_HASH;
    const operation: string = values.op;
    const gasPrice: number = 500;
    const gasLimit: number = 100000000;
    const requireIdentity: boolean = false;

    const account = await client.api.asset.getAccount();

    const parameters: any[] = [
      {type: 'String', value: account },
      {type: 'Integer', value: Number(values.amount)*CONST }
      ];

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
      alert(JSON.stringify(result));
      // tslint:disable-next-line:no-console
      console.log('onScCall finished, result:' + JSON.stringify(result));
    } catch (e) {
      alert('onScCall cancelled');
      // tslint:disable-next-line:no-console
      console.log('onScCall error:', e);
    }
    }
 
	render() {
		return(
		<div>
		<h2>Exchange</h2>
			<Form
	        initialValues={{
	          amount: 1,
	          op: "purchase_bank",
	        }}
	        // mutators={Object.assign({}, arrayMutators) as any}
	        onSubmit={this.onExch}
	        render={({
	          form,
	          handleSubmit
			        }) => (
			          <form onSubmit={handleSubmit}>         
			          <h4>Amount</h4>
			          <Field name="amount" className="field-bar-large" component="input" />
			          <br/><br/><br/>
			                
			          <div className="float-left-exch"><button className="main-button" type="submit" onClick={() => { form.change("op", "purchase_bank"); }}>ONG -> AES</button></div>
			          <div className="float-right-exch"><button className="main-button" type="submit" onClick={() => { form.change("op", "redeem_bank"); }}>AES -> ONG</button></div>     
			          <br />
			          <br />
			          </form>
			        )}
	        />
      </div>
		);
	}
}