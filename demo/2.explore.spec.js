const { expect } = require('chai')
const { queue } = require('..')
const { Client } = require('./support/client')
const { registration, notification, register, notify } = require('./support/exchanges')

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
        register({ subject:'weather', port:5003 }, (response)=>{
            expect(response.statusCode).to.equal(201)

            notify({ subject:'weather', message:'clear' }, (response)=>{
                expect(response.statusCode).to.equal(201)

                expect(client.received).to.deep.equal({ subject:'weather', message:'clear' })
                done()
            })
        })
    })
    it('does not notify unregistered subject', (done)=>{
        register({ subject:'weather', port:5003 }, (response)=>{
            expect(response.statusCode).to.equal(201)

            notify({ subject:'other', message:'any'}, (response)=>{
                expect(response.statusCode).to.equal(201)

                expect(client.received).to.deep.equal(undefined)
                done()
            })
        })
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
            register({ subject:'weather', port:5011 }, (response)=>{
                register({ subject:'weather', port:5012 }, (response)=>{
                    expect(response.statusCode).to.equal(201)

                    notify({ subject:'weather', message:'clear' }, (response)=>{
                        expect(response.statusCode).to.equal(201)

                        expect(one.received).to.deep.equal({ subject:'weather', message:'clear' })
                        expect(two.received).to.deep.equal({ subject:'weather', message:'clear' })
                        done()
                    })
                })
            })
        })
    })
})
