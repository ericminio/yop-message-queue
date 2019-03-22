const { request, createServer } = require('http')

var registration = function(options) {
    return {
        path:'/register?subject=' + options.subject + '&host=localhost&path=/&port='+options.port,
        method:'POST',
        port:5005
    }
}
var notification = function(options) {
    return {
        path:'/notify?subject=' + options.subject + '&message=' + options.message,
        method:'POST',
        port:5005
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
