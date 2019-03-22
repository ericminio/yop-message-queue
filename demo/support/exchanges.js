const { queue } = require('../..')

var registration = function(options) {
    return {
        path:'/register?subject=weather&host=localhost&path=/&port='+options.port,
        method:'POST',
        port:queue.port
    }
}
var notification = {
    path:'/notify?subject=weather&message=clear',
    method:'POST',
    port:queue.port
}

module.exports = {
    registration:registration,
    notification:notification
}
