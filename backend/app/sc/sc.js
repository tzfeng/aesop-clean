import { Crypto, Account, utils, RestClient, WebsocketClient, CONST, 
    TransactionBuilder, Parameter, ParameterType } from 'ontology-ts-sdk';
import { decimalToHex, sleep } from '../utils.js';

const sync_block = require('../sync/sync_block.js');
const config = require('../config.js');

const PRI_KEY = '342378ddaceb44e31fbac6ed4a59a2b748a906dcdd9a489f9f6f17b220b0bf51';//'3de98da14a2f9334a9050baa0fc09fe9c0e4cb1d6dca202b8c67e03110c47fbe';
// its acc is AabYzjuPMm42KTcWtZQ9qMZ3bc2Mxp2EQW

// const ADDRESS = 'AMrsgV6nAqnzypEebSZGvuQuG69fQEePCx'; 
const CONTRACT_HASH = config.ContractHash;
const GAS_LIM = '60000';
const CONST_10 = Math.pow(10, 8);

// let req = [22, 180];
// payout(req, null).then((ans)=>{ console.log(ans); });

export async function payout(req, res) {
    
    const restClient = new RestClient(config.url + ":20334");
    // const socketClient = new WebsocketClient(config.url + ':20335');

    const privateKey = new Crypto.PrivateKey(PRI_KEY);
    const account = Account.create(privateKey, 'l', 'test');

    const contract = utils.reverseHex(CONTRACT_HASH);
    const contractAddr = new Crypto.Address(contract);
    const method = 'payout';

    const params = [
                new Parameter('BetID', ParameterType.Integer, req[0]),
                new Parameter('Current_Price', ParameterType.Integer, req[1] * CONST_10)
                ];

    console.log(JSON.stringify(params));

    const tx = TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', GAS_LIM, account.address, false);
    TransactionBuilder.signTransaction(tx, privateKey);

    try {
    var txnString = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    var txn = txnString["Result"];
    console.log(JSON.stringify(txn));
    }
    catch (e) { console.log("Error in sendRawTransaction of sc payout.");
        throw e; }

    // await sleep(5000);

    // sync block
    try {
    var val = await sync_block.syncHistory(txn);
    console.log("Value returned by sync_block to sc.payout: " + val);
    if (val == undefined) process.exit();
    } 
    catch (e) {
        console.log("Error in value returned by sync block to sc payout.");
        throw e;
    }

    return val;
}
