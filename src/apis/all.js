const MessageApis = require('./message')

class Apis {
    /**
     * @param {Pigeon} pigeon pigeon server
     */
    constructor(pigeon) {
        this.pigeon = pigeon
        this.messages = new MessageApis(pigeon)
    }
}

module.exports = Apis