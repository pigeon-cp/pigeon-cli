class Pigeon {
    constructor(host, port, ssl) {
        this.host = host
        this.port = port
        this.ssl = ssl
    }

    url() {
        return `${this.ssl ? 'https' : 'http'}://${this.host}:${this.port}`
    }
}

module.exports = Pigeon
