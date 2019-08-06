/* tslint:disable */
import { SERVER } from './utils';
// import { FeedBox } from './feed-box';
import * as React from 'react';
import { FeedContent } from './comp/feed-content';

export async function getFeed(subUrl: string) {

	let url = SERVER + subUrl;

    let resp = await fetch(url, {
                method: 'GET',
                headers: new Headers()});
    let data = await resp.json();

    let all = []

   for (let bet of data) {

      let x = <li key={bet['_id']}><FeedContent against_rep={bet['against_avg_rep']}
      against_staked={bet['against_staked']}
      change={bet['change']}
      createdAt={bet['createdAt']}
      for_rep={bet['for_avg_rep']}
      for_staked={bet['for_staked']}
      prob={bet['prob']}
      date={bet['date']}
      sector={bet['sector']}
      target_price={bet['target_price']}
      ticker={bet['ticker']}
      id={bet['_id']} /></li>;

      all.push(x);    
    }

    return all;
}