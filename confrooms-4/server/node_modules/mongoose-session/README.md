# mongoose-session

Express 4 Middleware for MongoDB Session Storage using the Mongoose ODM

## Installation

    npm install mongoose-session
    
## Usage

    var express = require('express');
    
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/db');
    
    var app = express();
    
    app.use(require('express-session')({
        key: 'session',
        secret: 'SUPER SECRET SECRET',
        store: require('mongoose-session')(mongoose)
    }));

## Options

mongoose-session accepts options as a second parameters.

* `options.ttl` : allowed time of inactivity before a session is destroyed, in seconds (3600)
    
## Info

This works perfectly for my current use in projects, and requires no configuration. If your usage of mongoose-session would require any extra configuration to work properly, feel free to submit an issue or pull request, and I'll look over it and make any changes needed to be made for this to work for everyone. :)