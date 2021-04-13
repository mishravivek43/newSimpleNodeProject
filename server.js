/*
*Main server file
*configuration, port and important libraries are added here


*/

const express = require("express");
const path = require("path");

const http = require("http");
const bodyParser = require("body-parser");

const helmet = require("helmet");
const compression = require("compression");

const mongoose = require("mongoose");


const logger = require("morgan");
const router = express.Router();

const cors = require("cors");

require("dotenv").config({
    path: path.join(__dirname, ".env"),
});



const apiRoute = require("./routes/");
//const swaggerUi = require("swagger-ui-express");

//const swaggerDocument = require("./swaggerDoc.json");
const app = express();

let port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

let opts = {
    useNewUrlParser: true,
    keepAlive: 30000,
    bufferMaxEntries: 0,
    connectTimeoutMS: 45000,
    socketTimeoutMS: 60000,
    family: 4,
    reconnectTries: 30,
    reconnectInterval: 5000,
};

let dbUrl, envName;
if (process.env.NODE_ENV === "PROD") {
    dbUrl = process.env.DB_URL_PROD;
    envName = "PRODUCTION";
} else {
    dbUrl = process.env.DB_URL;
    envName = "DEVELOPMENT";
}

console.log(
    "---------------------------" +
    envName +
    " Environment---------------------------"
);
// const conn = mongoose.connect(dbUrl, opts);
// const db = mongoose.connection;
// db.on("connected", () => {
//     console.log("Successfully connected to database server!!");
// });

// db.on("error", err => {
//     console.log("Mongoose connection error : " + err);
// });
mongoose.connect(dbUrl,opts).then(() => {
console.log("Connected to Database");
console.log(
    "---------------------------" +
    envName +
    " Environment---------------------------"
);
console.log(dbUrl)
}).catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
    console.log('For local templates and db please install mongo db first');
});
app.use(helmet());
app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use("/api", apiRoute);
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/', express.static(path.join(__dirname, 'dist/meanBoiler')));

// app.use('/documentation', express.static(path.join(__dirname, 'documentation')));

// Catch all other routes and return the index file
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/meanBoiler/index.html'));
// });
// Parsers for POST data
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));

/**
 * Get port from environment and store in Express.
 */

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Listen on provided port, on all network interfaces.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("Listening on " + bind);
}

app.use((err, req, res, next) => {
    if (req.xhr) {
        res.status(500).send({ error: "Something failed!" });
    } else {
        next(err);
    }
});

app.use(function(err, req, res, next) {
    console.error("Error Stack", err.stack);
    res.status(500).send("Something broken!");
});

