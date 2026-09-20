const fs = require('fs');
const path = require('path');
const countriesService = require('./countries-services');

function getContentType(extname) {
    switch (extname.toLowerCase()) {
        case ".html": return "text/html";
        case ".js": return "text/javascript";
        case ".css": return "text/css";
        case ".png": return "image/png";
        case ".jpg":
        case ".jpeg": return "image/jpeg";
        case ".svg": return "image/svg+xml";
        case ".json": return "application/json";
        default: return "text/plain";
    }
}

function readAndServe(filePath, extname, res) {
    filePath = decodeURIComponent(filePath);

    // Case-insensitive fallback for assets
    if (!fs.existsSync(filePath) && filePath.includes('/assets/')) {
        filePath = filePath.replace('/assets/', '/Assets/');
    }

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.warn("[404 Not Found]:", filePath);
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server error: " + error.code);
        } else {
            res.writeHead(200, {
                "Content-Type": getContentType(extname),
                "Cache-Control": "no-cache" // Prevents stale CSS caching while developing
            });
            res.end(content);
        }
    });
}

function handleRequest(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
    let pathname = parsedUrl.pathname;

    // Ignore Chrome DevTools probing
    if (pathname.startsWith('/.well-known/')) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end();
        return;
    }

    // REST API Endpoint: GET /countries
    if (req.method === 'GET' && (pathname === '/countries' || pathname === '/countries/')) {
        countriesService.getAllCountries()
            .then(countries => {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.end(JSON.stringify(countries));
            })
            .catch(error => {
                console.error("Error in /countries route:", error);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: error.message }));
            });
        return;
    }

    // Default route to index.html
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }

    // Resolve static file path without URL query parameters
    let resolvedPath = path.join(__dirname, pathname);
    let extname = path.extname(resolvedPath);

    // Fallback: If style.css is placed inside a 'css' or 'styles' directory
    if (pathname.endsWith('.css') && !fs.existsSync(resolvedPath)) {
        const altCssPath = path.join(__dirname, 'css', path.basename(pathname));
        if (fs.existsSync(altCssPath)) {
            resolvedPath = altCssPath;
        }
    }

    if (extname) {
        readAndServe(resolvedPath, extname, res);
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
}

module.exports = {
    handleRequest,
    readAndServe,
    getContentType
};