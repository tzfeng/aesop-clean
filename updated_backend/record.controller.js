const Record = require('../models/record.model.js');
const sc = require('../sc/sc.js');
const sync_block = require('../sync/sync_block.js');
import { sleep } from '../utils.js'; 

exports.create = async function(req, res) {

    // Validate request
    if(!req.body.address) {
        return res.status(400).send({
            message: "address can not be empty"
        });
    }

    // Create a record
    const record = new Record({
        _id: req.body.address || 'Invalid address',
        record: []     
    });

    // Save bet in the database
    record.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the record."
        });
    });

};

// Find a single bet with a betId
exports.findOne = (req, res) => {
    Record.findById(req.params.address)
    .then(record => {
        if(!record) {
            return res.status(404).send({
                message: "record not found with address " + req.params.address
            });            
        }
        res.send(record);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "record not found with address " + req.params.address
            });                
        }
        return res.status(500).send({
            message: "Error retrieving record with address " + req.params.address
        });
    });
};


exports.update = async function(req, res) {
    // Validate Request
    if(!req.body.txn) {
        return res.status(400).send({
            message: "txn can not be empty"
        });
    }

    if(!req.body.address) {
        return res.status(400).send({
            message: "address can not be empty"
        });
    }

    // await sleep(3000);

    const txn = req.body.txn;
    console.log(txn);

    try {
    var val = await sync_block.syncRecord(txn);
    console.log("val? " + JSON.stringify(val));
    } 
    catch (e) {
        console.log(e);
        console.log("error: sync_block syncRecord; exiting");
        process.exit();
    }

    betId = val[1];
    betResult = val[2];
    betNet = val[3];

    const info = {
        _id: betId,
        result: betResult,
        net: betNet
    };

    // Find bet and update it with the request body
    Record.findByIdAndUpdate(req.body.address, 
        { "$push" : { "record" : info } },
        { "new": true, "upsert": true }
     )
    .then(record => { 
        if(!record) {
            return res.status(404).send({
                message: "record not found with address " + req.body.address
            });
        }
        console.log(record);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "record not found with address " + req.body.address
            });                
        }
        return res.status(500).send({
            message: "record updating bet with address " + req.body.address
        });
    });

}

exports.updatePayout = async function(req, res) {
    // Validate Request
    if(!req.body.txn) {
        return res.status(400).send({
            message: "txn can not be empty"
        });
    }

    if(!req.body.address) {
        return res.status(400).send({
            message: "address can not be empty"
        });
    }

    betId = req[0];
    address = req[1];
    info = req[2];

    // Find bet and update it with the request body
    Record.update(
        { _id: address, record: betId}, 
        { $set: {"record.$" : info}},
        { "new": true, "upsert": true }
     )
    .then(record => { 
        if(!record) {
            return res.status(404).send({
                message: "record not found with address " + req.body.address
            });
        }
        console.log(record);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "record not found with address " + req.body.address
            });                
        }
        return res.status(500).send({
            message: "record updating bet with address " + req.body.address
        });
    });

}

