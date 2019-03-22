const { createServer, request } = require('http')
const url = require('url')

const port = 5005
const clients = []
const queue = {
    start: (callback)=>{
        this.internal = createServer((incoming, response)=>{
            var called = url.parse(incoming.url, true)
            if ('/register' === called.pathname) {
                clients.push({
                    host: called.query.host,
                    port: parseInt(called.query.port),
                    path: called.query.path
                })
                response.writeHead(201)
                response.end()
            }
            if ('/notify' === called.pathname) {
                var client = clients[0]
                var notification = {
                    method:'POST',
                    host: client.host,
                    port: client.port,
                    path: client.path
                }
                var notify = request(notification, (r)=>{
                    response.writeHead(201)
                    response.end()
                })
                notify.write(JSON.stringify({
                    subject:called.query.subject,
                    message:called.query.message
                }))
                notify.end()
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
