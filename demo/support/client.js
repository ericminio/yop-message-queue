const { createServer } = require('http')

var Client = function(options) {
    this.port = options.port
    this.server = createServer((request, response)=>{
        var body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            this.received = JSON.parse(body)
            response.end()
        });
    })
}
Client.prototype.start = function(done) {
    this.server.listen(this.port, done)
}
Client.prototype.stop = function(done) {
    this.server.close(done)
}

module.exports = { Client:Client }
