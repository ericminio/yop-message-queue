const { request, createServer } = require('http')
const { queue } = require('../..')

var registration = function(options) {
    return {
        path:'/register?subject=' + options.subject + '&host=localhost&path=/&port='+options.port,
        method:'POST',
        port:queue.port
    }
}
var notification = function(options) {
    return {
        path:'/notify?subject=' + options.subject + '&message=' + options.message,
        method:'POST',
        port:queue.port
    }
}
var register = function(options, callback) {
    request(registration(options), callback).end()
}
var notify = function(options, callback) {
    request(notification(options), callback).end()
}

module.exports = {
    registration:registration,
    notification:notification,
    register:register,
    notify:notify
}
