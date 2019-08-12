const asyncHandler = require('express-async-handler')

module.exports = (app) => {
    const payout = require('../controllers/payout.controller.js');

    // Retrieve all bets
    app.get('/payouts', payout.findAll);

}