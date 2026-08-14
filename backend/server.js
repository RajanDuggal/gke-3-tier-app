const http = require('http');
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Hello from the Cloud-Native Backend!" }));
});
server.listen(8080, () => {
    console.log("Backend API running on port 8080");
});