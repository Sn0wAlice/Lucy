
/**
 * Get the lang of a page
 * <html * lang="en" *>
 */

module.exports.getLang = function (body) {
    if(body.includes("<html")) {

        if(body.split("<html")[1].split(">")[0].includes("lang=") ) {
            let lang = body.split("<html")[1]
            .split(">")[0]
            .split("lang=")[1]
            .replace(/'/g, '"')
            .split('"')[1]
        return lang || ''
        }
    }
    return ''
}