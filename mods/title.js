module.exports.getTitles = function (body) {
    if(body.includes("<title>")) {
        let title = body.split("<title>")[1]
            .split("title>")[0]
            .split("<").shift().join("<")
            .replace(/\n/g, "")
            .replace(/\r/g, "")
        while(title.includes("  ")) {
            title = title.replace("  ", " ")
        }
        while(title.startsWith(" ")) {
            title = title.substring(1)
        }
        while(title.endsWith(" ")) {
            title = title.substring(0, title.length - 1)
        }
        return title
    }
    return ""
}