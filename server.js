// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
const db = require('./models/db');
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.load();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var port = process.env.PORT || 9588;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.route('/directv')
    .get(function (req, res) {
        db.Channel.find({})
            .then((result) => { res.json(result); })
            .catch((err) => { console.log(err); res.json({ message: 'FAIL!' }); });
    });

router.route('/directv/fav')
    .get(function (req, res) {
        db.Channel.find({fav: true})
            .then((result) => { res.json(result); })
            .catch((err) => { console.log(err); res.json({ message: 'FAIL!' }); });
    });

router.route('/directv/:number')
    .put(function (req, res) {
        db.Channel.findOne({number: req.params.number})
            .then((result) => { 
                result.fav = req.body.fav;
                result.save();
                res.json({ message: 'Updated!' }); 
            })
            .catch((err) => { console.log(err); res.json({ message: 'FAIL!' }); });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
