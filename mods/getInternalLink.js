
// Get internal link from body

module.exports.getInternalLink = function (body, domain, path) {
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

    let internalLink = []
    for(let i = 0; i < link.length; i++) {
        if(link[i].startsWith('./')){
            internalLink.push(domain+path+link[i].substring(2))
        } else if(link[i].startsWith('/') && !link[i].startsWith('//')) {
            internalLink.push(domain+link[i])
        } else if(link[i].startsWith(domain)) {
            internalLink.push(link[i])
        }
    }

    // show all link
    return internalLink
}