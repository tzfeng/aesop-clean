import express from 'express';
const bodyParser = require('body-parser');
const Payout = require('./app/controllers/payout.controller.js');
import cors from 'cors';

// import Arena from 'bull-arena';
// import { queues, NOTIFY_URL } from './queues.js';

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

app.use(cors())

// Configuring the database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});


// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "- does this work???"});
});

require('./app/routes/bet.routes.js')(app);

require('./app/routes/scrape.routes.js')(app);

require('./app/routes/record.routes.js')(app);

require('./app/routes/payout.routes.js')(app);

// listen for requests
app.listen((process.env.PORT || 8000), () => {
    console.log("Server is listening on port 3000");
    setInterval(Payout.init, 300000);
});

/*
const Bet = require('./app/models/bet.model.js');

Bet.find({date: "01-01-2019"}, function (err, bets) {
  if (err) return console.error(err);
  console.log(bets[0]['betID']);
})*/




