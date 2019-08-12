const scrape = require('../scrape/scraper.ts');

exports.getPrice = async function(req, res) {
	// scrape price
	console.log(req.body.ticker);
    let price = undefined;
    try { 
    	price = await scrape.scrapePrice(req.body.ticker);
   		console.log(price);
    	res.status(200).send((price).toString())
    }
    catch (error) {
        return res.status(400).send("scraper died");
    }  

}