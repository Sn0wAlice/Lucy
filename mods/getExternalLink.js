
// Get external link from body

module.exports.getExternalLink = function (body, domain, path) {
    // Get all link
    let link = body.match(/href="([^"]*)"/g)
    let link2 = body.match(/href='([^']*)'/g)

    link = link || []
    link2 = link2 || []

    for(let i = 0; i < link.length; i++) {
        link[i] = link[i].replace('href="', "")
        link[i] = link[i].replace('"', "")
    }

    for(let i = 0; i < link2.length; i++) {
        link2[i] = link2[i].replace("href='", "")
        link2[i] = link2[i].replace("'", "")
    }

    link = link.concat(link2)

    // need to cleanup the link
    for(let i = 0; i < link.length; i++) {
        link[i] = link[i].split("#")[0]
        link[i] = link[i].replace(/\n/g, "").replace(/\r/g, "")
        link[i] = link[i].replace(/\t/g, "").replace(/\s/g, "")
        while(link[i].includes("  ")) {
            link[i] = link[i].replace("  ", " ")
        }
        while(link[i].startsWith(" ")) {
            link[i] = link[i].substring(1)
        }
        while(link[i].endsWith(" ")) {
            link[i] = link[i].substring(0, link[i].length-1)
        }
    }

    // remove duplicate
    link = [...new Set(link)]

    // remove nullable link
    for(let i = 0; i < link.length; i++) {
        if(link[i] == "") {
            link.splice(i, 1)
            i--
        }
    }

    let externalLink = []
    for(let i = 0; i < link.length; i++) {
        if(
            !link[i].startsWith('./') && 
            !link[i].startsWith('/') && 
            !link[i].startsWith(domain) && 
            !link[i].startsWith('data:') && 
            !link[i].startsWith('mailto:') && 
            !link[i].startsWith('javascript:') && 
            !link[i].startsWith('#')) {
            externalLink.push(link[i])
        } 
    }

    // add via regex
    const regex = /(http||https)\:\/\/[a-zA-Z0-9\.]{30,}\//g
    let match = body.match(regex)
    match = match || []
    for(let i = 0; i < match.length; i++) {
        if(!match[i].includes(domain)) {
            externalLink.push(match[i])
        }
    }

    // show all link
    return externalLink
}