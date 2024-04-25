const http = require('http');
const url = require('url');
const db = require('./db/database');
const { fetchCurrentTime } = require('./timeApi');  // Import the API call function


// Utility functions
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(data));
}

function sendText(res, statusCode, message) {
    res.writeHead(statusCode, {'Content-Type': 'text/plain'});
    res.end(message);
}

function handleError(res, err) {
    console.error(err);
    sendJSON(res, 500, { error: err.message });
}

// Request handlers
function handleGetData(req, res) {
    db.all("SELECT * FROM user", [], (err, rows) => {
        if (err) return handleError(res, err);
        sendJSON(res, 200, rows);
    });
}

function handleWriteData(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        db.run("INSERT INTO user (name) VALUES (?)", [body], function(err) {
            if (err) return handleError(res, err);
            sendText(res, 200, `A new user has been added with the rowid ${this.lastID}`);
        });
    });
}

function handleDeleteData(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const delReq = `DELETE FROM ${body}`;
        db.run(delReq, function(err) {
            if (err) {
                console.error("Error deleting from table:", err.message);
            sendText(res, 500, "Failed to delete from table");
            return;
            }
            sendText(res, 200, `All records deleted from ${body}. Rows affected: ${this.changes}`);
        });
    });
}

function handleTimeRequest(req, res) {
    fetchCurrentTime((err, time) => {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end("Failed to fetch time");
            return;
        }
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(`Current UTC Time: ${time}`);
    });
}

function handleDefault(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<html><body><h1>My Web App</h1><button onclick="fetch('/data').then(response => response.json()).then(data => alert(JSON.stringify(data)))">Fetch Data</button></body></html>`);
}

// Simple router
function router(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    if (path === '/data' && req.method === 'GET') {
        handleGetData(req, res);
    } else if (path === '/data/write' && req.method === 'POST') {
        handleWriteData(req, res);
    } else if (path === '/data/delete' && req.method === 'DELETE') {
        handleDeleteData(req, res);
    } else if (path === '/time' && req.method === 'GET') {
        handleTimeRequest(req, res);
    } else {
        handleDefault(req, res);
    } 
}

const server = http.createServer(router);

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

