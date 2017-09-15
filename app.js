var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var apiKey = 'bbfa06b5c2c74aac9a240800171509';
var requestUrl = 'https://api.worldweatheronline.com/premium/v1/weather.ashx?q=new+york&num_of_days=5&tp=24&format=json&key=' + apiKey;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

function dayOfWeekAsString(dayIndex) {
  return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][dayIndex];
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    request(requestUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            // parse the json result
            var result = JSON.parse(body);

           // generate a HTML table
           var html = '<table style="font-size: 10px; font-family: Arial, Helvetica, sans-serif">';

           // loop through each row
           for (var i = 0; i < 3; i++) {
               html += "<tr>";

               result.data.weather.forEach(function(weather) {
                   html += "<td>";
                   switch (i) {
                       case 0:
                           html += dayOfWeekAsString(new Date(weather.date).getDay());
                           break;
                       case 1:
                           html += weather.hourly[0].weatherDesc[0].value;
                           break;
                       case 2:
                           var imgSrc = weather.hourly[0].weatherIconUrl[0].value;
                           html += '<img src="'+ imgSrc + '" alt="" />';
                           break;
                  }
                  html += "</td>";
              });
              html += "</tr>";
          }

          res.send(html);
        } else {
           console.log(error, response.statusCode, body);
        }
        res.end("");
    });
});
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
