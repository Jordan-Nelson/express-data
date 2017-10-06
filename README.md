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
A simple use of the library can be seen below. For each request, express-data will create an object to record a UUID, the URL, method, and the time elapsed for the request. The 'onEndRequest' config property is used to perform actions such as saving this data to a database. In the example below, it is simply logged to the console

```javascript
var express = require('express');
var expressData = require('express-data');

var app = express();

var onEndRequest = function(req) {
    var data = req.expressData.getData();
    console.log(data); // data can be saved to db, written to log, etc.
}

var newExpressData = new expressData({onEndRequest: onEndRequest});

app.use(function(req, res, next) {
    return newExpressData.interceptor(req, res, next)
})

app.get('/', function(req, res, next) {
    res.send('hello world!');
})

app.listen(8080, function() {
    console.log('Now listening on port 8080!')
});
```

Below is sample data object returned from the 'getData' method.
```javascript
{ 
    uuid: '611ebefd-333c-4e60-89c1-ebfefef8f1e5',   // UUID for the request
    url: '/',                                       // url for the route (equal to req.url)
    method: 'GET',                                  // method for the route (equal to req.method)
    startTime: [ 799091, 60135903 ],                // High Resolution start time [seconds, nanoseconds]
    stopTime: [ 799091, 60620821 ],                 // High Resolution end time [seconds, nanoseconds]
    timeElapsed: 0.48491799999999996                // The time elapsed for the request in milliseconds 
}
```

### Recording Custom Events
By default, the time elapsed is only recorded for the entire length of the request. Recording the time elapsed for specific events within the request is simple though. Below is an example of how to use the methods 'record' and 'stop' to record the time elapsed for custom events. The example below uses the node module 'sleep' to demonstrate a lapse in time.
```javascript
var express = require('express');
var expressData = require('express-data');
var sleep = require('sleep')

var app = express();

var onEndRequest = function (req) {
    var data = req.expressData.getData();
    console.log(data); // data can be saved to db, written to log, etc.
}

var newExpressData = new expressData({ onEndRequest: onEndRequest });

app.use(function (req, res, next) {
    return newExpressData.interceptor(req, res, next)
})

app.get('/', function (req, res, next) {
    req.expressData.record('sub-process');
    sleep.msleep(50);
    req.expressData.stop('sub-process');
    sleep.msleep(10);
    res.send('Hello World!')
})

app.listen(8080, function () {
    console.log('Now listening on port 8080!')
});
```
Below is sample data object returned from the 'getData' method.
```javascript
{ 
    uuid: 'c3ed3a53-19ca-4a28-9606-162e1cc655b3',
    url: '/',
    method: 'GET',
    startTime: [ 801560, 512820399 ],
    stopTime: [ 801560, 581876264 ],
    timeElapsed: 65.055865,
    'sub-process': {                        // The name of the event
        startTime: [ 801560, 513196912 ],   // High Resolution start time [seconds, nanoseconds]
        stopTime: [ 801560, 565268404 ],    // High Resolution end time [seconds, nanoseconds]
        timeElapsed: 52.071492              // The time elapsed for the event in milliseconds 
    }
}
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
Used to override the default logic used to detect when requests are complete. This indicates that the request has finished and sets req.stopTime to the current time, and computes the req.timeElapsed.

NOTE: This method is called when automatically when a response is sent to the user. The following methods will cause this method to trigger: res.send(), res.sendFile(), res.sendStatus(), res.render(), res.json(), res.jsonp(), and res.end().
#### Arguments
None
#### Sample
```javascript
app.get('/', function(req, res, next) {
    // Read from file system, cache, db, etc.
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
    uuid: '611ebefd-333c-4e60-89c1-ebfefef8f1e5',   // UUID for the request
    url: '/',                                       // url for the route (equal to req.url)
    method: 'GET',                                  // method for the route (equal to req.method)
    startTime: [ 799091, 60135903 ],                // High Resolution start time [seconds, nanoseconds]
    stopTime: [ 799091, 60620821 ],                 // High Resolution end time [seconds, nanoseconds]
    timeElapsed: 0.48491799999999996                // The time elapsed for the request in milliseconds 
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
