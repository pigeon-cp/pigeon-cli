const { func } = require('assert-plus')
const request = require('request')

class MessageApis {
    constructor(pigeon) {
        this.pigeon = pigeon
    }

    /**
     * send a specify type message
     * 
     * @param {*} type message type
     */
    send(type, { target, sender, title, content, channel, account_id }, opts) {
        request.post(`${this.pigeon.url()}/messages/${type}`, {
            json: {
                target, sender, title, content, channel, accountId: account_id
            }
        }, (err, resp, body) => {
            if(err) {
                console.error(err)
            } else {
                console.log(body)
            }
        })
    }
}

module.exports = MessageApis
