const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end('Hello from Jenkins-built app\n');
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(port, () => console.log(`Server listening on ${port}`));
