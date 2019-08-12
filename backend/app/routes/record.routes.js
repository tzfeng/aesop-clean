const asyncHandler = require('express-async-handler')

module.exports = (app) => {
    const records = require('../controllers/record.controller.js');

    // Create a user's record
    app.post('/records', asyncHandler(async (req, res, next) => {
    const bar = await records.create(req, res);
    // res.send(bar);
    }));

    // Retrieve a user record
    app.get('/records/:address', records.findOne);

    // Update a user's record when they vote 
    app.put('/records/view_history', asyncHandler(async (req, res, next) => {
    const bar = await records.update(req, res);
    }));

    // update the record of a user when they create a bet
    /*app.post('/create_bet', asyncHandler(async (req, res, next) => {
    const bar = await records.update(req, res);
    }));*/

}