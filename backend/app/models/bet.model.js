const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

// address, amt_staked, ticker, sign, margin, time
const BetSchema = mongoose.Schema({
	_id: Number,
	ticker: String,
	change: Number,
	target_price: Number,
	// curr_price: Number,
	date: String,
 	for_staked: Number,
 	against_staked: Number,
 	for_avg_rep: Number,
 	against_avg_rep: Number,
 	prob: Number,
	sector: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Bet', BetSchema);