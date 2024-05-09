const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
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

function sendFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('File not found!');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
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
        res.end(`Current CEST Time: ${time}`);
    });
}

function handleDefault(req, res) {
    // Try to serve static files
    const parsedUrl = url.parse(req.url);
    let pathname = `./public${parsedUrl.pathname}`;
    const ext = path.extname(pathname);
    let contentType = 'text/html';

    if (ext === '.css') {
        contentType = 'text/css';
    } else if (ext === '.js') {
        contentType = 'application/javascript';
    } else if (ext.length === 0) {
        pathname += '/index.html';
    }

    sendFile(res, pathname, contentType);
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
