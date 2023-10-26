
/**
 * Get all content from a html page.
 * extract all the text from the html page.
 */

module.exports.getText = function (body) {
    const regex = /<[pdivh1-6].*?>(.*?)<\/[pdivh1-6]>/g
    let text = body.match(regex)

    if (text) {
        text = text.map((t) => {
            return t.replace(/<.*?>/g, '')
        })
        text = text.join('||')
    } else {
        text = ''
    }

    return text
}