const { createServer, request } = require('http')
const { parse } = require('url')
const { Promise, Promises } = require('yop-promises')

var registrations = []

const port = 5005
const queue = {
    clearRegistrations: ()=>{
        registrations = []
    },
    start: (callback)=>{
        this.internal = createServer((incoming, response)=>{
            var called = parse(incoming.url, true)
            if ('/register' === called.pathname) {
                registrations.push({
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
                for (var i=0; i<registrations.length; i++) {
                    var client = registrations[i]
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
        this.internal.listen(port, callback)
    }
}
queue.port = port

queue.start(()=>{
    console.log('queue listening on port', port)
})

module.exports = {
    queue:queue
}
