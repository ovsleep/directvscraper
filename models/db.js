var mongoose = require( 'mongoose' ); 

mongoose.Promise = require('bluebird');

var dbURI = 'mongodb://localhost:27017/directv'; 

//mongoose.connect(process.env.MONGOLAB_URI); 

mongoose.connect(dbURI); 

mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
}); 

mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
}); 

module.exports = {
    Channel: require('./channel'),
}

