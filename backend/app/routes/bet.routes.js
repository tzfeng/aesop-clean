const asyncHandler = require('express-async-handler')

module.exports = (app) => {
    const bets = require('../controllers/bet.controller.js');

    // Create a new bet
    app.post('/bets', asyncHandler(async (req, res, next) => {
    const bar = await bets.create(req, res);
    // res.send(bar);
    }));


    //app.get('/bets', bets.findAll);
    
    // Retrieve all bets
    app.get('/bets', asyncHandler(async (req, res, next) => {
    const bar = await bets.findAll(req, res);
    // res.send(bar);
    }));

    // Retrieve a single bet with betId
    app.get('/bets/:betId', bets.findOne);

    // Update a bet with betId 
    app.put('/bets/:betId', asyncHandler(async (req, res, next) => {
    const bar = await bets.update(req, res);
    }));

    // Update a bet with betId - vote
    app.put('/vote', asyncHandler(async (req, res, next) => {
    const bar = await bets.update(req, res);
    }));

    // Delete a bet with betId
    app.delete('/bets/:betId', bets.delete);

}