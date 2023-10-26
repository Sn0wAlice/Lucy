
/**
 * Get the input of a page
 * <input *>
 */

module.exports.getInputs = function (body) {
    const regex = /<input[^>]*>/g
    const inputs = body.match(regex) || []
    const obj = []
    for(let o of inputs) {

        if(o.includes(`='`)) {
            o = o.replace(`='`, `="`)
            // replace the last ' with "
            let last = o.lastIndexOf(`'`)
            o = o.substring(0, last) + `"` + o.substring(last+1)
        }

        const d = {
            id: (o.match(/id="([^"]*)"/) || [])[1] || "",
            type: (o.match(/type="([^"]*)"/) || [])[1] || "",
            name: (o.match(/name="([^"]*)"/) || [])[1] || "",
            value: (o.match(/value="([^"]*)"/) || [])[1] || "",
            placeholder: (o.match(/placeholder="([^"]*)"/) || [])[1] || "",
            required: (o.match(/required="([^"]*)"/) || [])[1] || "",
            maxlength: (o.match(/maxlength="([^"]*)"/) || [])[1] || "",
            minlength: (o.match(/minlength="([^"]*)"/) || [])[1] || "",
            size: (o.match(/size="([^"]*)"/) || [])[1] || "",
            checked: (o.match(/checked="([^"]*)"/) || [])[1] || "",
            disabled: (o.match(/disabled="([^"]*)"/) || [])[1] || "",
            readonly: (o.match(/readonly="([^"]*)"/) || [])[1] || "",
            hidden: (o.match(/hidden="([^"]*)"/) || [])[1] || "",
            multiple: (o.match(/multiple="([^"]*)"/) || [])[1] || "",
            accept: (o.match(/accept="([^"]*)"/) || [])[1] || "",
            pattern: (o.match(/pattern="([^"]*)"/) || [])[1] || "",
            autocomplete: (o.match(/autocomplete="([^"]*)"/) || [])[1] || ""
        }
        obj.push(d)
    }

    return obj
}