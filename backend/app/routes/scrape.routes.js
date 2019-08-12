const asyncHandler = require('express-async-handler')

module.exports = (app) => {
    const scrapes = require('../controllers/scrape.controller.js');

    // Retrieve a single bet with betId
    app.put('/scrapes', asyncHandler(async (req, res, next) => {
    const bar = await scrapes.getPrice(req, res);
    // res.send(bar);
    }));
}