/* tslint:disable */
import { client } from 'ontology-dapi';
// import * as React from 'react';
import { CONTRACT_HASH, CONST, HexToInt, convertValue } from './utils';

// returns rep, tokens, wallet
export async function rep() {

      try {
      var account: any = await client.api.asset.getAccount();   
      console.log("rep acc: " + account);
      }
      catch (e) {
        throw e;
      }

      const scriptHash = CONTRACT_HASH;
      const operation = 'user_tab';
      
      const parameters: any[] = [
          { type: 'String', value: account },
          ];
      
      const args = parameters.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
   
      console.log("rep args: " + JSON.stringify(args));

        try{
          const res = await client.api.smartContract.invokeRead({ scriptHash, operation, args });
          // const res: any = await client.api.smartContract.invokeRead(params);
          console.log('receive: ' + JSON.stringify(res));

          if (res == "00") return -1;
          //let vals = res['result']['Result'];
          console.log("vals[2]: "+ res[2]);

          return [HexToInt(res[0])/CONST - CONST, HexToInt(res[1])/CONST, HexToInt(res[2])/(CONST*10)];

        }catch(err) {
          console.log(err);
        }
}

