let AWS = require("aws-sdk");

let credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;
AWS.config.update({region:'us-west-2'});

const client = new AWS.Rekognition();

module.exports = client;