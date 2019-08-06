/* tslint:disable */
import { ParameterType } from 'ontology-dapi';

export function HexToInt(num: any) {
    num = String(num);
    return parseInt('0x'+num!.match(/../g).reverse().join(''));
}

export function convertValue(value: string, type: ParameterType) {
  switch (type) {
    case 'Boolean':
      return value; //Boolean(value);
    case 'Integer':
      return Number(value);
    case 'ByteArray':
      return value;
    case 'String':
      return value; // client.api.utils.strToHex(value);
  }
}

export function reverseHex(input: string): string {
let out = '';
for (let i = input.length - 2; i >= 0; i -= 2) {
  out += input.substr(i, 2);
}
return out;
}

export const CONST = Math.pow(10, 8);

export const CONTRACT_HASH = '3249c8337fbfb47e2788ddf584900d78f224de47'; //'1809444acf2327f7aa6c22542248bb68062d9553';

export const SERVER = 'https://damp-plains-34339.herokuapp.com/';//'http://192.168.3.252:3000/';

  