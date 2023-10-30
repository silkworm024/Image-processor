let mysql = require('mysql2')
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'image',
  password: '20040402qaZ/',
  database: 'image'
})

connection.connect(function(err) {
    if (err) {
      console.error('Error connecting to database: ' + err.stack);
      return;
    }
  
    console.log('Connected to database.');
  });

module.exports = connection;