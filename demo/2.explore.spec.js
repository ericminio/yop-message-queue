const { expect } = require('chai')
const { request, createServer } = require('http')
const { queue } = require('..')

describe('message queue', ()=>{

    var client = {}
    beforeEach((done)=>{
        client.server = createServer((request, response)=>{
            var body = '';
            request.on('data', (chunk) => {
                body += chunk;
            });
            request.on('end', () => {
                client.received = JSON.parse(body)
                response.end()
            });
        })
        client.server.listen(5003, done)
    })
    afterEach((done)=>{
        client.server.close(done)
    })

    it('accepts registration', (done)=>{
        var registration = {
            path:'/register?subject=weather&host=localhost&port=5003&path=/',
            method:'POST',
            port:queue.port
        }
        var register = request(registration, (response)=>{
            expect(response.statusCode).to.equal(201)

            var notification = {
                path:'/notify?subject=weather&message=clear',
                method:'POST',
                port:queue.port
            }
            var notify = request(notification, (response)=>{
                expect(response.statusCode).to.equal(201)

                expect(client.received).to.deep.equal({ subject:'weather', message:'clear' })
                done()
            })
            notify.end()
        })
        register.end()
    })
})
