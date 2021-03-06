/**
 * utils for access github api
 */

const request = require('request')

let releases_cache

module.exports = {
    async tags(opt) {
        let ls = (await this.releases())
        console.log(`tags: ${ls}`)
        return ls.map(r => {
            let name = r['tag_name']
            if (opt) {
                if(!opt.prefix) {
                    name = name.replace(/^v/, '')
                }
            }
            return name
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
            // find release by tag
            return r['tag_name'] === tag
        })[0]['assets']
        .filter(asset => {
            // find jar asset item by name
            return asset.name === 'pigeon.tar.gz'
        })[0]['browser_download_url']
    }
}