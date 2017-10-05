# express-stats
A simple express middle ware librayr for recording statistics for your express server. 

## Features
- Record stats (mehtod, url, uuid, time elapsed, etc.) for a request
- Record stats (time elapsed, etc.) for specific tasks within a request (e.g. database query, read from cache, call to external API)
- Execute a callback function when the request is completed to perform actions such as logging stats, or writing the stats to a database.
- Verbose mode to allow for debugging and creating quick examples and testing

## Install
```
npm install express-stats
```

## Sample Use
### Basic Use
A basic use of the library can be seen below. By setting verbose to true, each stat will log to the console when the event is marked complete with the stop() method. The method call, req.expressStats.record('event-name'), will create an event with the name 'event-name' and record the start time. The method call, req.expressStats.stop('event-name'), will record the end time, and calculate the time elapsed for the event.

```javascript
var express = require('express');
var expressStats = require('express-stats');

var app = express();

var newExpressStats = new expressStats({verbose: true});

app.use((req, res, next) => newExpressStats.interceptor(req, res, next));

app.get('/', function(req, res, next) {
    req.expressStats.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressStats.stop('event-name');
})

app.listen(8080, function() {
    console.log('Now listening on port 8080!')
});
```

The following output is a sample console output from the app.
```
Now listening on port 8080!
event-name: (59.594539ms)
event-name: (56.262868ms)
```

### Sample Use with Callback
By adding an onEndRequest parameter to the config object, the data can be record in a database, recorded in a log, etc.
```javascript
var express = require('express');
var expressStats = require('express-stats');

var app = express();

// This function will execute each time the endRequest method is called
var onEndRequest = function(req) {
    var data = req.expressStats.getData();
    // This function can be used to acheive recording data in a database, logging the data, sending it to web server, etc.
}

var newExpressStats = new expressStats({onEndRequest: onEndRequest});

app.use((req, res, next) => newExpressStats.interceptor(req, res, next));

app.get('/', function(req, res, next) {
    req.expressStats.record('event-name');
    setTimeout(function() {
        res.send('hello world!');
        req.expressStats.stop('event-name');
    }, 50)
    req.expressStats.endRequest('event-name');
})

app.listen(8080, function() {
    console.log('Now listening on port 8080!')
});
```

## API

### expressStats(config)
#### Description
Express stats contructor.
#### Arguments
| Argument                           | Type          | Desciption                                                           |
|:---------------------------------- |:------------- |:-------------------------------------------------------------------- |
| config (optional)                  | object        | Configuration object                                                 |
| config.verbose (optional)          | boolean       | false by default. A value of true will cause event info to be logged.|
| config.onEndRequest(req) (optional)| function      | A callback function to be called each time that req.expressStats.endRequest() is called.|
#### Sample
```javascript
app.get('/', function(req, res, next) {
    req.expressStats.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressStats.stop('event-name');
})
```

### record(): req.expressStats.record(name)
#### Description
Creates a new event object, and sets the event.startTime to the current time. If the event already exists on the req object, a warning is logged
#### Arguments
| Argument         | Type          | Desciption                               |
|:---------------- |:------------- |:---------------------------------------- |
| name             | string        | The name of the event to record.         |
#### Sample
```javascript
app.get('/', function(req, res, next) {
    req.expressStats.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressStats.stop('event-name');
})
```

### stop(): req.expressStats.stop(name)
#### Description
Sets the event.stopTime to the current time, and computes the event.timeElapsed. 
#### Arguments
| Argument         | Type          | Desciption                               |
|:---------------- |:------------- |:---------------------------------------- |
| name             | string        | The name of the event to stop.           |
#### Sample
```javascript
app.get('/', function(req, res, next) {
    req.expressStats.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressStats.stop('event-name');
})
```

### endRequest(): req.expressStats.endRequest()
#### Description
Used to indicate that the request has finished. Sets req.stopTime to the current time, and computes the req.timeElapsed.
#### Arguments
None
#### Sample
```javascript
app.get('/', function(req, res, next) {
    // Read from file system, cache, db, etc.
    res.send();
    req.expressStats.end();
})
```

### getData(): req.expressStats.getData()
#### Description
Used to retreive the data for the curernt request object.
#### Arguments
None
#### Returns
an object with the following properties
```javascript
{ 
    uuid: '37e17a13-2860-44bf-b0e9-86d71d8beae7',
    url: '/',
    method: 'GET',
    startTime: [ 752567, 649034259 ],
    'event-name-1':
    { 
        startTime: [ 752567, 649381159 ],
        stopTime: [ 752567, 706358528 ],
        timeElapsed: 56.977368999999996 
    } 
}
```
#### Sample
```javascript
app.get('/', function(req, res, next) {
    req.expressStats.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressStats.stop('event-name');
    var data = req.expressStats.getData()
    console.log(data);
})
```
