const database = require('./main.js')
const fs = require('fs')

const ext = JSON.parse(fs.readFileSync('./ext.json', 'utf8'))

function generateRanomString(length){
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let str = ""
    for(let i = 0; i < length; i++){
        str += chars[Math.floor(Math.random() * chars.length)]
    }
    return str
}

function generateUID(){
    return `${generateRanomString(12)}-${generateRanomString(4)}-${generateRanomString(4)}-${Date.now()}-${generateRanomString(16)}`
}


module.exports = async function insertInDatabase(data) {
    //og(data)
    
    if(data == undefined) return
    if(data.domain == undefined) return

    // check if url is: "http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion/onions/"
    if(data.domain == "juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion" && data.path == '/onions/') {
        // only inject the links
        data.internal = []
        await dataNeedToBeAddedToWait(data, true)
        return
    }


    // Step 0: add the domain
    await addDomain(data)

    // Step 1: add the url
    const urltoken = await addURL(data)

    // Step 2,3: add the url
    await addExternalUrl(data, urltoken)
    await addInternalUrl(data, urltoken)
    
    // Step 4,5: add imgs and audios
    await addImgs(data, urltoken)
    await addAudio(data, urltoken)

    // Step 6: add videos, and video sources
    await addVideo(data, urltoken)

    // Step 7: add forms
    await addForms(data, urltoken)


    // Step 8: add data
    await addData(data, urltoken)

    // Step 9: add data to wait
    await dataNeedToBeAddedToWait(data)
}


/**
 * From step 0
 */
async function addDomain(data) {
    // check if the domain is in the database
    const domain = await database.request(`SELECT * FROM domain WHERE domain='${data.domain}'`)
    if(domain.length == 0) {
        // add the domain
        await database.insert('domain', {
            domain: data.domain
        })
    }
}

/**
 * From step 1
 */
async function addURL(data){
    // check if the url is in the database
    const url = await database.request(`SELECT * FROM url WHERE path='${data.path}' AND domain='${data.domain}'`)

    let token = ""
    //securise the string
    data.lang = data.lang.replace(/'/g, "_27")
    data.title = data.title.replace(/'/g, "_27")
    data.path = data.path.replace(/'/g, "_27")
    
    if(url.length == 0) { // add in database
        // add the url
        token = generateUID()
        await database.insert('url', {
            token: token,
            domain: data.domain,
            path: data.path,
            title: data.title,
            lang: data.lang,
            last_update: Date.now()
        })
    } else { // update in database
        token = url[0].token
        await database.update(
            'url', 
            `title='${data.title}', lang='${data.lang}', last_update=${Date.now()}`,
            `token='${url[0].token}'`
        )
    }
    return token
}

/**
 * From step 2
 */
async function addExternalUrl(data, urltoken){
    for(let u of data.link.external){
        u = u.replace(/'/g, "_27")

        for(let i of ext) {
            if(!u.includes(i)) {
                // check if url is in the database
                const url = await database.request(`SELECT * FROM external_link WHERE urltoken='${urltoken}' AND link='${u}'`)
                        
                if(u.startsWith('http://') || u.startsWith('https://')){
                    if(url.length == 0){
                        // add the url
                        await database.insert('external_link', {
                            urltoken: urltoken,
                            link: u
                        })
                    }
                }
            }
        }
    }
}

/**
 * From step 3
 */
async function addInternalUrl(data, urltoken) {
    for(let u of data.link.internal){
        const path = u.split(data.domain)[1].replace(/'/g, "_27")

        let pass = true

        for(let i of ext) {
            if(path.includes(i)) pass = false
        }

        if(pass) {
            const url = await database.request(`SELECT * FROM internal_link WHERE urltoken='${urltoken}' AND path='${path}'`)

            if(url.length == 0){
                // add the url
                await database.insert('internal_link', {
                    urltoken: urltoken,
                    path: path
                })
            }
        }
    }
}

/**
 * From step 4
 */
async function addImgs(data, urltoken){
    for(let u of data.media.img){
        u.src = u.src.replace(/'/g, "_27")
        u.alt = u.alt.replace(/'/g, "_27")
        u.id = u.id.replace(/'/g, "_27")
        u.width = (u.width == '') ? 0 : (Number(u.width) == NaN) ? 0 : Number(u.width)
        u.height = (u.height == '') ? 0 : (Number(u.height) == NaN) ? 0 : Number(u.height)

        const img = await database.request(`SELECT * FROM imgs WHERE urltoken='${urltoken}' AND src='${u.src}'`)

        if(img.length == 0){
            // add the url
            await database.insert('imgs', {
                token: generateUID(),
                urltoken: urltoken,
                src: u.src,
                alt: u.alt,
                id: u.id,
                width: u.width,
                height: u.height
            })
        } else {
            await database.update(
                'imgs', 
                `alt='${u.alt}', id='${u.id}', width=${u.width}, height=${u.height}`,
                `token='${img[0].token}'`
            )
        }
    }
}

/**
 * From step 5
 */
async function addAudio(data, urltoken){
    for(let u of data.media.audio){
        u.src = u.src.replace(/'/g, "_27")
        u.alt = u.alt.replace(/'/g, "_27")
        u.id = u.id.replace(/'/g, "_27")

        const audio = await database.request(`SELECT * FROM audio WHERE urltoken='${urltoken}' AND src='${u.src}'`)

        if(audio.length == 0){
            // add the url
            await database.insert('audio', {
                token: generateUID(),
                urltoken: urltoken,
                src: u.src,
                alt: u.alt,
                id: u.id
            })
        } else {
            await database.update(
                'audio', 
                `alt='${u.alt}', id='${u.id}'`,
                `token='${audio[0].token}'`
            )
        }
    }
}

/**
 * From step 6
 */
async function addVideo(data, urltoken){
    for(let u of data.media.video){
        u.alt = u.alt.replace(/'/g, "_27")
        u.id = u.id.replace(/'/g, "_27")
        u.width = (u.width == '') ? 0 : (Number(u.width) == NaN) ? 0 : Number(u.width)
        u.height = (u.height == '') ? 0 : (Number(u.height) == NaN) ? 0 : Number(u.height)

        let token = ""

        const video = await database.request(`SELECT * FROM video WHERE urltoken='${urltoken}' AND id='${u.id}' OR alt='${u.alt}'`)

        if(video.length == 0){
            // add the url
            token = generateUID()
            await database.insert('video', {
                token: token,
                urltoken: urltoken,
                alt: u.alt,
                id: u.id,
                width: u.width,
                height: u.height
            })
        } else {
            token = video[0].token
            await database.update(
                'video', 
                `alt='${u.alt}', id='${u.id}', width=${u.width}, height=${u.height}`,
                `token='${video[0].token}'`
            )
        }

        // same for all the sources
        for(const source of u.sources){
            const s = await database.request(`SELECT * FROM video_source WHERE video_token='${token}' AND src='${source.src}'`)
            if(s.length == 0){
                // add the url
                await database.insert('video_source', {
                    video_token: token,
                    src: source.src,
                    type: source.type
                })
            } else {
                await database.update(
                    'video_source', 
                    `type='${source.type}'`,
                    `video_token='${token}'`
                )
            }
        }
    }
}

/**
 * From step 7
 */
async function addForms(data, urltoken){
    for(let form of data.forms){
        form.id = form.id.replace(/'/g, "_27")
        form.name = form.name.replace(/'/g, "_27")
        form.action = form.action.replace(/'/g, "_27")
        form.method = form.method.replace(/'/g, "_27")
        form.enctype = form.enctype.replace(/'/g, "_27")
        form.acceptCharset = form.acceptCharset.replace(/'/g, "_27")
        form.autocomplete = form.autocomplete.replace(/'/g, "_27")
        form.novalidate = form.novalidate.replace(/'/g, "_27")

        let token = ""

        const check = await database.request(`SELECT * FROM forms WHERE pagetoken='${urltoken}' AND id='${form.id}' OR name='${form.name}'`)

        if(check.length == 0) {
            token = generateUID()

            //insert the form
            await database.insert('forms', {
                token: token,
                pagetoken: urltoken,
                id: form.id,
                name: form.name,
                action: form.action,
                method: form.method,
                enctype: form.enctype,
                accept_charset: form.acceptCharset,
                autocomplete: form.autocomplete,
                novalidate: form.novalidate
            })

        } else {
            token = check[0].token

            await database.update(
                'forms', 
                `name='${form.name}', action='${form.action}', method='${form.method}', enctype='${form.enctype}', accept_charset='${form.acceptCharset}', autocomplete='${form.autocomplete}', novalidate='${form.novalidate}'`,
                `token='${token}'`
            )
        }


        // add the inputs
        for(let input of form.inputs){
            input.id = input.id.replace(/'/g, "_27")
            input.type = input.type.replace(/'/g, "_27")
            input.value = input.value.replace(/'/g, "_27")
            input.placeholder = input.placeholder.replace(/'/g, "_27")
            input.required = (input.required == '') ? 0 : 1
            input.maxlength = (input.maxlength == '') ? 0 : (Number(input.maxlength) == NaN) ? 0 : Number(input.maxlength)
            input.minlength = (input.minlength == '') ? 0 : (Number(input.minlength) == NaN) ? 0 : Number(input.minlength)
            input.size = input.size.replace(/'/g, "_27"),
            input.checked = (input.checked == '') ? 0 : 1
            input.disable = (input.disable == '') ? 0 : 1
            input.readonly = (input.readonly == '') ? 0 : 1
            input.hidden = (input.hidden == '') ? 0 : 1
            input.multiple = (input.multiple == '') ? 0 : 1
            input.accept = input.accept.replace(/'/g, "_27")
            input.pattern = input.pattern.replace(/'/g, "_27")
            input.autocomplete = (input.checked == '') ? 0 : 1

            const check2 = await database.request(`SELECT * FROM inputs WHERE formtoken='${token}' AND id='${input.id}' AND type='${input.type}' AND value='${input.value}'`)
            
            if(check2.length == 0){
                await database.insert('inputs', {
                    "token": generateUID(),
                    formtoken: token,
                    type: input.type,
                    value: input.value,
                    placeholder: input.placeholder,
                    required: input.required,
                    maxlength: input.maxlength,
                    minlength: input.minlength,
                    size: input.size,
                    checked: input.checked,
                    disable: input.disable,
                    readonly: input.readonly,
                    hidden: input.hidden,
                    multiple: input.multiple,
                    accept: input.accept,
                    pattern: input.pattern,
                    autocomplete: input.autocomplete,
                    id: input.id
                })
            } else {
                await database.update(
                    'inputs', 
                    `id='${input.id}', type='${input.type}', value='${input.value}', placeholder='${input.placeholder}', required=${input.required}, maxlength=${input.maxlength}, minlength=${input.minlength}, size='${input.size}', checked=${input.checked}, disable=${input.disable}, readonly=${input.readonly}, hidden=${input.hidden}, multiple=${input.multiple}, accept='${input.accept}', pattern='${input.pattern}', autocomplete=${input.autocomplete}`,
                    `token='${check2[0].token}'`
                )
            }
            
        }


    }
}

/**
 * From step 8
 */


async function addData(data, urltoken){
    data.text = data.text.replace(/'/g, "_27").replace(/%/g, "_25")
    const check = await database.request(`SELECT * FROM content WHERE urltoken='${urltoken}'`)

    if(data.text == '') return
    if(data.text.length > 100000) return

    if(check.length == 0){
        // add the url
        await database.insert('content', {
            urltoken: urltoken,
            content: data.text
        })
    } else {
        await database.update(
            'content', 
            `content='${data.text}'`,
            `token='${check[0].token}'`
        )
    }
}

/**
 * From step 9
 */
async function dataNeedToBeAddedToWait(data, forcebypass = false) {

    // internal links
    for(let u of data.link.internal){
        const path = u.split(data.domain)[1].replace(/'/g, "_27")

        let pass = true

        for(let i of ext) {
            if(path.includes(i)) pass = false
        }

        if(pass) {
            const url = await database.request(`SELECT * FROM url WHERE path='${path}' AND domain='${data.domain}'`)
            if(url.length == 0){
                const check2 = await database.request(`SELECT * FROM wait WHERE fullurl='http://${data.domain}${path}'`)
                if(check2.length == 0){
                    await database.insert('wait', {
                        fullurl: `http://${data.domain}${path}`
                    })
                }
            }
        }
    }

    // external links
    for(let u of data.link.external){

        if(u.includes('.onion') && u.startsWith("http") && u.includes('://') && !u.includes(' ')) {
            const domain = u.split('://')[1].split('/')[0]
            if(domain.endsWith('.onion')){
                const url = (forcebypass) ? [] : await database.request(`SELECT * FROM url, wait WHERE url.path='/' AND url.domain='${domain}' OR wait.fullurl='${u}'`)
                if(url.length == 0){
                    console.log("insert in wait: ", u)
                    await database.insert('wait', {
                        fullurl: u
                    })
                }
            }
        }

        
    }

}