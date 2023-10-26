const tr = require('tor-request');
const fs = require('fs');

const ext = JSON.parse(fs.readFileSync('./ext.json', 'utf8'))

console.log(fs.readFileSync('./utils/ascii.art', 'utf8'))

const migrateDB = require('./database/migrate.js')
const insertInDatabase = require('./database/insert.js')
const getnewurl = require('./database/getnewurl.js')
const deletefromWait = require('./database/deletefromWait.js')
const reinject = require('./database/reinject.js')

// all the local import
const getTitle = require('./mods/title.js').getTitles
const getLang = require('./mods/lang.js').getLang
const getInternalLink = require('./mods/getInternalLink.js').getInternalLink
const getExternalLink = require('./mods/getExternalLink.js').getExternalLink
const getForms = require('./mods/forms.js').getForms
const getMedia = require('./mods/media.js').getMedia
const getText = require('./mods/content.js').getText


let initmode = false
let isexpired = false

start()

async function request(url) {
    return new Promise((resolve, reject) => {
        try {
            tr.request(url, function (err, res, body) {

                if(err) {
                    resolve(null)
                }
                
                resolve({
                    res: res,
                    body: body
                })
            });
        } catch (error) {
            resolve(null)
        }
    })
}

function getprettydate() {
    const date = new Date()
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

async function main() {

    if(initmode) {
        setTimeout(main, 60000 + Math.floor(Math.random() * 1000))
        return 
    }

    const newurl = await getnewurl()

    if(newurl.length == 0) {
        setTimeout(main, 20000 + Math.floor(Math.random() * 10000))
        return
    }

    if(newurl[0].fullurl == "http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion/onions/") {
        console.log("Init mode")
        initmode = true
    }

    console.log(`${getprettydate()} - Working on ${newurl[0].fullurl}`)

    const domain = "http://"+newurl[0].fullurl.split('://')[1].split('/')[0]
    const path = '/'+newurl[0].fullurl.split('://')[1].split('/').slice(1).join('/')

    await deletefromWait(newurl[0].fullurl)

    const req = await request(domain+path)
   
    if(req == null || req.err || req.body == undefined || req.body == null) {
        await reinject(newurl[0].fullurl)
        try { console.log(`${getprettydate()} - Error: ${req.err.message}`) } catch (error) { }
        // wait 10 seconds
        setTimeout(main, 5000 + Math.floor(Math.random() * 1000))
        return
    }

    for(let i = 0; i < ext.length; i++) {
        if(path.includes(ext[i])) {
            setTimeout(main, 5000 + Math.floor(Math.random() * 1000))
            return 
        }
    }

    const obj = {
        domain: domain.split("://")[1].split('/')[0],
        path: path,
        title: getTitle(req.body),
        lang: getLang(req.body),
        link: {
            internal: getInternalLink(req.body, domain, path),
            external: getExternalLink(req.body, domain, path)
        },
        forms: getForms(req.body),
        media: getMedia(req.body),
        text: getText(req.body)
    }

    //fs.writeFileSync('./tmp/data.json', JSON.stringify(obj, null, 2))

    await insertInDatabase(obj)

    if(initmode) {
        initmode = false
    }

    if(!isexpired) {
        main()
    }
}

async function start() {
    setTimeout(() => {
        isexpired = true
        process.exit(0)
    }, 1000 * 60 * 25 + Math.floor(Math.random() * 100000))
    await migrateDB()
    for(let i = 0; i < 20; i++) {
        main()
    }
}