const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

// address, amt_staked, ticker, sign, margin, time
const RecordSchema = mongoose.Schema({
	_id: String,
	bets: Array,
	results: Array,
	net: Array
}, {
    timestamps: true
});

module.exports = mongoose.model('Record', RecordSchema);