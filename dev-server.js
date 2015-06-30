var express         = require('express');
var httpPort        = parseInt(process.env.PORT, 10) || 4000;

var events          = require('events');
var eventEmitter    = new events.EventEmitter();

var app             = express();
var geoip           = require('geoip-lite');

// Simple timestamp function. Invoke with timestamp();
var htimeStamp = function() {
    var date = new Date();
    var result = '[' + date.getFullYear() + '/' + date.getMonth() + '/' +
        date.getDate() + '/' + date.getHours() + ':' +
        date.getMinutes() + ':' + date.getSeconds() + ']';
    return result;
};

/**
 * Configure Logger
 */
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'myapp'});

/**
 *  Configure the HTTP webServer.
 */
var httpServer = app.listen(httpPort, function() {
    //debug('Express webServer listening on httpPort ' + webServer.address().httpPort);
    console.log(__dirname);
    console.log('Edit index.html and try localhost:4000 in your web browser.');
    console.log('Listening on httpPort: ' + httpPort);
    console.log('node -v: ' + process.versions.node);
});

var ioHttp = require('socket.io').listen(httpServer);

/**
 *  Initialize website(s).
 */
// This app is routed to a variable called homepage called homepage calling express. You can host multiple websites by following homepage as a template.
var www = express();

// Config for router.
www.set('strict routing', true);
www.enable('case sensitive routing');

/**
 *  Explicitly setup the website(s)' resources.
 */
www.use('/js', express.static(__dirname + '/js'));
www.use('/css', express.static(__dirname + '/css'));
www.use('/fonts', express.static(__dirname + '/fonts'));

// eg. http://localhost:4000/manga_index/another_world_it_exists_index.json
app.use('/manga_index',express.static(__dirname + '/manga_index'));
// eg. http://localhost:4000/manga/another_world_it_exists/vo1/001.jpg ... 002.jpg
app.use('/manga',express.static(__dirname + '/manga'));

/**
 *  Serve web content.
 */
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
    eventEmitter.emit('process IP', req.ip);
});

// '*' denotes catch all. If the above routes do not trigger, respond with 404.
app.get('*', function(req, res) {
    // Replace with your own custom 404.
    res.send('404 not found.'); // send text response
});

/**
 *  Events
 */
eventEmitter.on('process IP', function(ip) {
    log.info({'time' : htimeStamp()}, geoip.lookup(ip));
});
