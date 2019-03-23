const { createServer, request } = require('http')
const { parse } = require('url')
const { Promise, Promises } = require('yop-promises')
const { execute } = require('yop-postgresql')

const Queue = function(port) {
    this.port = port
}
Queue.prototype.clearRegistrations = function(done) {
    execute('truncate table queue', ()=> { done() })
}
Queue.prototype.stop = function(done) {
    this.internal.close(done)
}
Queue.prototype.start = function(done) {
    this.internal = createServer((incoming, response)=>{
        var called = parse(incoming.url, true)
        if ('/register' === called.pathname) {
            var sql = 'insert into queue(subject, host, port, path) values ($1, $2, $3, $4)'
            var params = [called.query.subject, called.query.host, called.query.port, called.query.path]
            execute(sql, params, (rows, error)=>{
                if (error) {
                    response.writeHead(500)
                    response.end(error)
                }
                else {
                    response.writeHead(201)
                    response.end()
                }
            })
        }
        if ('/notify' === called.pathname) {
            var sql = 'select host, port, path from queue where subject=$1'
            execute(sql, [called.query.subject], (registrations, error)=>{
                if (error) {
                    response.writeHead(500)
                    response.end(error)
                }
                else {
                    var ps = new Promises()
                    ps.done(()=>{
                        response.writeHead(201)
                        response.end()
                    })
                    for (var i=0; i<registrations.length; i++) {
                        var client = registrations[i]
                        var p = new Promise()
                        ps.waitFor(p)
                        var notification = {
                            method:'POST',
                            host: client.host,
                            port: client.port,
                            path: client.path
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
                    if (ps.promises.length == 0) { ps.resolveCallback() }
                }
            })

        }
    })
    this.internal.listen(this.port, done)
}
module.exports = {
    Queue:Queue
}
