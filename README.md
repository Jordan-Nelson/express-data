# express-stats
A simple way to record statistics for your express server

## Features
- Record total time elapsed for a request
- Record stats (i.e. time elapsed) for specific tasks within a request (e.g. database query, read from cache, call to external API)
    - Name the tasks with a given string name
- Execute a callback function when the request is "complete" (e.g. write the stats to a database)
- Verbose mode to allow for debugging and creating quick examples

## Install
```
npm install express-stats
```

## Sample use

```
var express = require('express');
var expressStats = require('express-stats');

var app = express();

var newExpressStats = new expressStats({verbose: true});

app.use((req, res, next) => newExpressStats.interceptor(req, res, next));


app.get('/', function(req, res, next) {
    req.expressStats.record('mock-db-call');
    setTimeout(function() {
        res.send('hello world!');
        req.expressStats.stop('mock-db-call');
    }, 50)
})

app.listen(8080, function() {
    console.log('Now listening on port 8080!')
});
```