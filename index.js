const { createServer, request } = require('http')
const { parse } = require('url')
const { Promise, Promises } = require('yop-promises')
const Queue = function(port) {
    this.port = port
    this.clearRegistrations()
}
Queue.prototype.clearRegistrations = function() {
    this.registrations = []
}
Queue.prototype.stop = function(done) {
    this.internal.close(done)
}
Queue.prototype.start = function(done) {
    this.internal = createServer((incoming, response)=>{
        var called = parse(incoming.url, true)
        if ('/register' === called.pathname) {
            this.registrations.push({
                subject: called.query.subject,
                client: {
                    host: called.query.host,
                    port: parseInt(called.query.port),
                    path: called.query.path
                }
            })
            response.writeHead(201)
            response.end()
        }
        if ('/notify' === called.pathname) {
            var ps = new Promises()
            ps.done(()=>{
                response.writeHead(201)
                response.end()
            })
            for (var i=0; i<this.registrations.length; i++) {
                var client = this.registrations[i]
                if (client.subject == called.query.subject) {
                    var p = new Promise()
                    ps.waitFor(p)
                    var notification = {
                        method:'POST',
                        host: client.client.host,
                        port: client.client.port,
                        path: client.client.path
                    }
                    var notify = request(notification, (r)=>{
                        p.resolve()
                    })
                    notify.write(JSON.stringify({
                        subject:called.query.subject,
                        message:called.query.message
                    }))
                    notify.end()
                }
            }
            if (ps.promises.length == 0) { ps.resolveCallback() }
        }
    })
    this.internal.listen(this.port, done)
}
module.exports = {
    Queue:Queue
}
