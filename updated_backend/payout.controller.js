const scrape = require('../scrape/scraper.ts');
const sc = require('../sc/sc.js');
const schedule = require('node-schedule');
const moment = require('moment');
const Bet = require('../models/bet.model.js');
const Payout = require('../models/payout.model.js');
const record = require('./record.controller.js');

exports.init = async function(req, res) {

		// const date = moment.utc();
		// // console.log(date.format('HH'));

		// if (date.format('HH') !== "04") { return; }
		
		// const now = date.format('YYYY-MM-DD');
		const now = "2019-08-13"; 


		// for everything in database with exp date now
		Bet.find({ date: now }, async(err, payout_bets) => {
			// console.log("payout is running .. ");

			if (err) return console.log("beginning of payout " + err);

			if (payout_bets.length == 0) console.log("no bets that match");
		
			for (let bet of payout_bets) {

				console.log(JSON.stringify(bet));

				var id = bet['_id'];
				console.log(id);

				if (id == -404) { 
					bet.remove(); 
					// console.log("removed 404 ");
					continue; 
				}
				var ticker = bet['ticker'];

				let current_price = 5;
	    		try { 
	    		current_price = await scrape.scrapePrice(ticker);
	    		// console.log("price " + current_price);
	    		}
	    		catch (error) {
	        		return res.status(400).send("scraper died");
	    		}

	    		console.log("current_price : " + current_price);

		        var params = [id, Number(current_price)];	
		        console.log("Payout controller params : " + JSON.stringify(params));	        
   
		        try {
		            var bet_result = await sc.payout(params, null);
		        }
		        catch (e) {
		        	console.log("Error in value returned by sc payout to payout controller.")
		        	console.error(e);
		        	process.exit(0);
		        }

		     //    var final_result;
		     //    if (Number(bet['change']) < 0) {
		     //    	if (current_price < Number(bet['target_price']) ) {
		     //    		final_result = 'Correct'
		     //    	}
		     //    	else { final_result = 'Incorrect'}
		     //    }
		    	// else if (Number(bet['change']) > 0) {
		     //    	if (current_price > Number(bet['target_price'])) {
		     //    		final_result = 'Correct'
		     //    	}
		     //    	else { final_result = 'Incorrect'}		    		
		    	// }
		    	// else {
		    	// 	if (current_price === Number(bet['target_price'])) { final_result = 'Draw' }
		    	// }


		        const payout = new Payout({
	        		betId: id,
					ticker: bet['ticker'],
					change: Number(bet['change']),
					target_price: Number(bet['target_price']),
					date: bet['date'],
				 	for_staked: Number(bet['for_staked']),
				 	against_staked: Number(bet['against_staked']),
				 	for_avg_rep: Number(bet['for_avg_rep']),
				 	against_avg_rep: Number(bet['against_avg_rep']),
				 	prob: Number(bet['prob']),
					sector: bet['sector'],
					result: bet_result[0]
		        });

		        await bet.remove();

    // Save bet in the database
			    payout.save()
			    .then(data => {
			        // res.send(data);
			    }).catch(err => {
			    	throw err;
			        /*res.status(500).send({
			            message: err.message || "Some error occurred while creating the bet."
			        });*/
			    });
			    
			    // update all user record for this bet
			    for (let entry of bet_result[1].entries()) {
			    	const address = entry[0], info = entry[1];
			    	input_info = {
			    		_id: info[0],
			    		result: info[1],
			    		net: info[2]
			    	}
			    	record.updatePayout(id, address, input_info);
			    }
			}		
		});

}

// Retrieve and return all expired bets from the database.
exports.findAll = (req, res) => {
    Payout.find()
    .then(payouts => {
        res.send(payouts);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving expired bets."
        });
    });
};