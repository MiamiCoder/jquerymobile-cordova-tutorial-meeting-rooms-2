var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    expressSession = require('express-session'),
    mongooseSession = require('mongoose-session'),  // https://github.com/chncdcksn/mongoose-session
    //usersRoutes = require('./routes/users');
    accountRoutes = require('./routes/account');
    app = express(),
    port = 30000;

var dbName = 'bookitDB';
var connectionString = 'mongodb://localhost:27017/' + dbName;

mongoose.connect(connectionString);

app.use(expressSession({
        key: 'session',
        secret: '128013A7-5B9F-4CC0-BD9E-4480B2D3EFE9',
        store: new mongooseSession(mongoose),
        resave: true,
        saveUninitialized: true
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', accountRoutes);

var server = app.listen(port, function () {
    console.log('Express server listening on port ' + server.address().port);
});