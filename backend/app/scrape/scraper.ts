/* tslint:disable */

const cheerio = require('cheerio');
const request = require('request');

// let ticker = "AAPL";

exports.scrapePrice = async function(ticker) {

    return new Promise(function(resolve, reject){
    request({
    method: 'GET',
    url: `https://finance.yahoo.com/quote/${ticker}?p=${ticker}` //'https://www.nasdaq.com/symbol/aapl'
    }, (err, res, body) => {

    if (err) reject(err);

    let $ = cheerio.load(body);

    let price=$('#quote-header-info > div.My\\(6px\\).Pos\\(r\\).smartphone_Mt\\(6px\\) > div.D\\(ib\\).Va\\(m\\).Maw\\(65\\%\\).Maw\\(60\\%\\)--tab768.Ov\\(h\\) > div > span.Trsdu\\(0\\.3s\\).Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)').text();
    
    resolve(price);
    
    });
   });
}

exports.scrapeSect = async function(ticker) {

    return new Promise(function(resolve, reject){
        request({
            method: 'GET',
            url: 'https://finance.yahoo.com/quote/AAPL/profile?p=AAPL' //'https://www.nasdaq.com/symbol/aapl'
        }, (err, res, body) => {

            if (err) return console.error(err);

            let $ = cheerio.load(body);

            const ind = '#Col1-0-Profile-Proxy > section > div.asset-profile-container > div > div';
            const ind2 = $("p[class='D(ib) Va(t)']", ind).html();
            const ind3 = $("span[data-reactid='21']", ind2).text();

            //const industry = $('#Col2-12-QuoteModule-Proxy > div > div > div > div > p.D\\(ib\\).Va\\(t\\) > span:nth-child(2)').text();
            resolve(ind3);
        });
    });
}