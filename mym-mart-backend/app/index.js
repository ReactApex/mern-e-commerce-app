// imports modules & dependencies
const express = require('express');
const favicon = require('serve-favicon');
const crossOrigin = require('cors');
const cookieParser = require('cookie-parser');
const appRoot = require('app-root-path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const env = require('dotenv');

// imports application routes & middleware
const morganLogger = require('../src/middleware/morgan.logger');
const defaultController = require('../src/controllers/default.controller');
const { notFoundRoute, errorHandler } = require('../src/middleware/error.handler');
const corsOptions = require('../src/configs/cors.config');
const authRoute = require('../src/routes/auth.routes');
const userRoute = require('../src/routes/user.routes');

// load environment variables from .env file
env.config();

// initialize express app
const app = express();

// application database connection establishment
const connectDatabase = require('../src/database/connect.mongo.db');

connectDatabase();

// HTTP request logger middleware
app.use(morganLogger());

// secure HTTP headers setting middleware
app.use(helmet());

// allow cross-origin resource sharing
app.use(crossOrigin(corsOptions));

// parse cookies from request
app.use(cookieParser());

// parse body of request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// sets favicon in API routes
app.use(favicon(`${appRoot}/public/favicon.ico`));

// sets static folder
app.use(express.static('public'));

// parse requests of content-type ~ application/json
app.use(express.json());

// parse requests of content-type ~ application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// response default (welcome) route
app.get('/', defaultController);

// sets application API's routes
app.use('/api/v1', authRoute); // auth routes
app.use('/api/v1', userRoute); // user routes

// 404 ~ not found error handler
app.use(notFoundRoute);

// 500 ~ internal server error handler
app.use(errorHandler);

// default export ~ app
module.exports = app;