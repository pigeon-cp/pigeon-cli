/**
 * utils for access github api
 */

const request = require('request')

let releases_cache

module.exports = {
    async tags() {
        let ls = (await this.releases())
        return ls.map(r => {
            return r['tag_name']
        })
    },
    releases() {
        return new Promise((resolve, reject) => {
            if(!releases_cache) {
                request.get('https://api.github.com/repos/pigeon-cp/pigeon/releases', {
                    headers: {
                        'User-Agent': 'pigeon-cli'
                    }
                }, (err, resp, body) => {
                    if(err) {
                        console.error(err)
                        resolve([])
                    } else {
                        releases_cache = JSON.parse(body).filter(r => r.assets && r.assets.length > 0)
                        resolve(releases_cache)
                    }
                })
            } else {
                resolve(releases_cache)
            }
        })
    },
    async jar_download_url(tag) {
        let releases = await this.releases()
        return releases.filter(r => {
            return r['tag_name'] === tag
        })[0]['assets'][0]['browser_download_url']
    }
}