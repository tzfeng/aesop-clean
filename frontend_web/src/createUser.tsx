/* tslint:disable */
export {};
import { client } from 'ontology-dapi';
import * as React from 'react';
import { RouterProps } from 'react-router';
import './css/button.css';
import { CONTRACT_HASH, convertValue } from './utils';
import { Field, Form } from 'react-final-form';

/* tslint:disable */
export const CreateUser: React.SFC<RouterProps> = (props) => {

  function toFeed() {
    props.history.push('/feed');
  }

  async function onCreate(values: any) {

    const scriptHash: string = CONTRACT_HASH;
    const operation: string = 'create_user';
    const gasPrice: number = 500;
    const gasLimit: number = 100000000;
    const requireIdentity: boolean = false;

    const account = await client.api.asset.getAccount();

    const parameters: any[] = [
      {type: 'String', value: account },
      {type: 'String', value: values.username },
      {type: 'String', value: values.bio }
      ];

    const args = parameters.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
    alert(JSON.stringify(args));
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

    toFeed();
  }

  function onBack() {
    props.history.goBack();
  }

  return (
    <div>
      <h2>Create account</h2>
      <Form
        initialValues={{
          username: "nutterbutter",
          bio: "ok here some characters"
        }}
        // mutators={Object.assign({}, arrayMutators) as any}
        onSubmit={onCreate}
        render={({
          form,
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit}>         
          <h4>Username</h4>
          <Field name="username" className="field-bar" component="input" />
          <br/>
          <br/>
          <h4>Enter bio (50 characters max)</h4>
          <Field name="bio" className="field-bar" component="input" />
          <br />
          <br />
          <button className="sec-button" type="submit">Create account!</button>
          </form>
        )}
      />
      
      <br />
      <button onClick={onBack} className="back-button">&lt;</button>
    </div>
  );
};

// <button onClick={onCreate} className="main-button">Create account!</button>
