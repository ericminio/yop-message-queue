const { expect } = require('chai')
const { request, createServer } = require('http')
const { queue } = require('..')
const { Client } = require('./support/client')
const { registration, notification } = require('./support/exchanges')

describe('message queue', ()=>{

    var client
    beforeEach((done)=>{
        client = new Client({ port:5003 })
        client.start(done)
    })
    afterEach((done)=>{
        client.stop(done)
    })

    it('accepts registration', (done)=>{
        var register = request(registration({ port:5003 }), (response)=>{
            expect(response.statusCode).to.equal(201)

            var notify = request(notification, (response)=>{
                expect(response.statusCode).to.equal(201)

                expect(client.received).to.deep.equal({ subject:'weather', message:'clear' })
                done()
            })
            notify.end()
        })
        register.end()
    })
    it('does not notify unregistered subject', (done)=>{
        var register = request(registration({port:5003}), (response)=>{
            expect(response.statusCode).to.equal(201)
            var notification = {
                path:'/notify?subject=other&message=any',
                method:'POST',
                port:queue.port
            }
            var notify = request(notification, (response)=>{
                expect(response.statusCode).to.equal(201)

                expect(client.received).to.deep.equal(undefined)
                done()
            })
            notify.end()
        })
        register.end()
    })

    describe('several clients', ()=>{

        var one, two
        beforeEach((done)=>{
            queue.clearRegistrations()
            one = new Client({ port:5011 })
            one.start(()=>{
                two = new Client({ port:5012 })
                two.start(done)
            })
        })
        afterEach((done)=>{
            one.stop(()=>{
                two.stop(done)
            })
        })

        it('can register to the same subject', (done)=>{
            var register = request(registration({ port:5011 }), (response)=>{
                var register = request(registration({ port:5012 }), (response)=>{
                    expect(response.statusCode).to.equal(201)

                    var notify = request(notification, (response)=>{
                        expect(response.statusCode).to.equal(201)

                        expect(one.received).to.deep.equal({ subject:'weather', message:'clear' })
                        expect(two.received).to.deep.equal({ subject:'weather', message:'clear' })
                        done()
                    })
                    notify.end()
                })
                register.end()
            })
            register.end()
        })
    })
})
