/**
 * Get the input of a page
 * <input *>
 */

const getInputs = require('./inputs.js').getInputs

module.exports.getForms = function (body) {
    const regex = /<form[^>]*>/g
    const form = body.match(regex) || []
    let form_list = body.split("<form").slice(1) || []
    const obj = []
    for(let o of form) {
        if(o.includes(`='`)) {
            o = o.replace(`='`, `="`)
            // replace the last ' with "
            let last = o.lastIndexOf(`'`)
            o = o.substring(0, last) + `"` + o.substring(last+1)
        }

        const d = {
            id: (o.match(/id="([^"]*)"/) || [])[1] || "",
            name: (o.match(/name="([^"]*)"/) || [])[1] || "",
            action: (o.match(/action="([^"]*)"/) || [])[1] || "",
            method: (o.match(/method="([^"]*)"/) || [])[1] || "",
            enctype: (o.match(/enctype="([^"]*)"/) || [])[1] || "",
            acceptCharset: (o.match(/accept-charset="([^"]*)"/) || [])[1] || "",
            autocomplete: (o.match(/autocomplete="([^"]*)"/) || [])[1] || "",
            novalidate: (o.match(/novalidate="([^"]*)"/) || [])[1] || "",
            inputs: getInputs(form_list.shift().split("</form")[0])
        }
        obj.push(d)
    }

    return obj
}