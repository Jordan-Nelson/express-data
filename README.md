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
The most basic use of the library can be seen below. By setting verbose to true, each stat will log to the console when created. The function call, req.expressStats.record('mock-db-call'), will create an event with the name 'mock-db-call' and record the start time. The function call, req.expressStats.stop('mock-db-call'), will record the end time, and calculate the time elapsed for the event.

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

The following output is a sample console output from the app.
```
Now listening on port 8080!
mock-db-call: (59.594539ms)
mock-db-call: (56.262868ms)
```

## API

.record(event_name: string)

.stop(event_name: string)

.end()

