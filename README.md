# express-data
A simple express middleware library for recording data from an express server. 

## Features
- Record data (mehtod, url, uuid, time elapsed, etc.) for a request
- Record data (time elapsed, etc.) for specific tasks within a request (e.g. database query, read from cache, call to external API)
- Execute a callback function when the request is completed to perform actions such as logging data, or writing the data to a database.
- Verbose mode to allow for debugging and creating quick examples and testing

## Install
```
npm install express-data
```

## Sample Use
### Basic Use
A basic use of the library can be seen below. By setting verbose to true, each stat will log to the console when the event is marked complete with the stop() method. The method call, req.expressData.record('event-name'), will create an event with the name 'event-name' and record the start time. The method call, req.expressData.stop('event-name'), will record the end time, and calculate the time elapsed for the event.

```javascript
var express = require('express');
var expressData = require('express-data');

var app = express();

var newExpressData = new expressData({verbose: true});

app.use((req, res, next) => newExpressData.interceptor(req, res, next));

app.get('/', function(req, res, next) {
    req.expressData.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressData.stop('event-name');
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
By adding an onEndRequest parameter to the config object, the data can be recorded in a database, recorded in a log etc.
```javascript
var express = require('express');
var expressData = require('express-data');

var app = express();

// This function will execute each time the endRequest method is called
var onEndRequest = function(req) {
    var data = req.expressData.getData();
    // This function can be used to acheive recording data in a database, logging the data, sending it to web server, etc.
}

var newExpressData = new expressData({onEndRequest: onEndRequest});

app.use((req, res, next) => newExpressData.interceptor(req, res, next));

app.get('/', function(req, res, next) {
    req.expressData.record('event-name');
    setTimeout(function() {
        res.send('hello world!');
        req.expressData.stop('event-name');
        req.expressData.endRequest();
    }, 50)
})

app.listen(8080, function() {
    console.log('Now listening on port 8080!')
});
```

## API

### expressData(config)
#### Description
Express data contructor.
#### Arguments
| Argument                           | Type          | Desciption                                                           |
|:---------------------------------- |:------------- |:-------------------------------------------------------------------- |
| config (optional)                  | object        | Configuration object                                                 |
| config.verbose (optional)          | boolean       | false by default. A value of true will cause event info to be logged.|
| config.onEndRequest(req) (optional)| function      | A callback function to be called each time that req.expressData.endRequest() is called.|
#### Sample
```javascript
var expressData = require('express-data');
var expressDataConfig = {
    verbose: true,
    onEndRequest: function(req) {
        console.log(req.expressData.getData());
    }
}
var newExpressData = new expressData(expressDataConfig);
```

### record(): req.expressData.record(name)
#### Description
Creates a new event object, and sets the event.startTime to the current time. If the event already exists on the req object, a warning is logged
#### Arguments
| Argument         | Type          | Desciption                               |
|:---------------- |:------------- |:---------------------------------------- |
| name             | string        | The name of the event to record.         |
#### Sample
```javascript
app.get('/', function(req, res, next) {
    req.expressData.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressData.stop('event-name');
})
```

### stop(): req.expressData.stop(name)
#### Description
Sets the event.stopTime to the current time, and computes the event.timeElapsed. 
#### Arguments
| Argument         | Type          | Desciption                               |
|:---------------- |:------------- |:---------------------------------------- |
| name             | string        | The name of the event to stop.           |
#### Sample
```javascript
app.get('/', function(req, res, next) {
    req.expressData.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressData.stop('event-name');
})
```

### endRequest(): req.expressData.endRequest()
#### Description
Used to indicate that the request has finished. Sets req.stopTime to the current time, and computes the req.timeElapsed.
#### Arguments
None
#### Sample
```javascript
app.get('/', function(req, res, next) {
    // Read from file system, cache, db, etc.
    res.send();
    req.expressData.end();
})
```

### getData(): req.expressData.getData()
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
    req.expressData.record('event-name');
    // EVENT (Read from file system, cache, db, etc.)
    req.expressData.stop('event-name');
    var data = req.expressData.getData()
    console.log(data);
})
```
