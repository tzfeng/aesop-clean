const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

const Record = mongoose.Schema({
	_id: Number,
	result: Number,
	net: Number
})

// address, amt_staked, ticker, sign, margin, time
const RecordSchema = mongoose.Schema({
	_id: String,
	record: [Record]
}, {
    timestamps: true
});

module.exports = mongoose.model('Record', RecordSchema);