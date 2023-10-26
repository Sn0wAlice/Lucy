
/**
 * Get the media of a page
 */

module.exports.getMedia = function (body) {
    return {
        img: getIMG(body),
        audio: getAUDIO(body),
        video: getVideo(body)
    }
}

function getIMG(body) {
    // <img src="https://www.w3schools.com/images/picture.jpg" alt="Mountain">
    const regex = /<img[^>]*>/g
    const img = body.match(regex) || []
    const l = []
    for(let i of img) {

        if(i.includes(`='`)) {
            i = i.replace(`'`, `"`)
        }


        let data = {
            src: (i.match(/src="([^"]*)"/) || [])[1] || "",
            alt: (i.match(/alt="([^"]*)"/) || [])[1] || "",
            width: ((i.match(/width="([^"]*)"/) || [])[1] || "").replace("px", "").replace("%", "").split('.')[0].split(',')[0],
            height: ((i.match(/height="([^"]*)"/) || [])[1] || "").replace("px", "").replace("%", "").split('.')[0].split(',')[0],
            id: (i.match(/id="([^"]*)"/) || [])[1] || ""
        }
        if(data.width == NaN) data.width = 0
        if(data.height == NaN) data.height = 0

        l.push(data)

    }
    return l
}

function getAUDIO(body) {
    // <audio src="https://www.w3schools.com/html/horse.mp3" controls>
    const regex = /<audio[^>]*>/g
    const audio = body.match(regex) || []

    const l = []
    for(let i of audio) {

        if(i.includes(`='`)) {
            i = i.replace(`'`, `"`)
        }

        l.push({
            src: (i.match(/src="([^"]*)"/) || [])[1] || "",
            alt: (i.match(/alt="([^"]*)"/) || [])[1] || "",
            id: (i.match(/id="([^"]*)"/) || [])[1] || ""
        })

    }
    return l
}

function getVideo(body) {
    let list = body.split("<video")
    if(list.length == 1) return []

    let videolist = []

    list.shift()

    for(let i = 0; i < list.length; i++) {
        let realElement = list[i].split("</video")[0]

        if(realElement.includes(`='`)) {
            realElement = realElement.replace(`'`, `"`)
        }

        // check if video contains source, or src
        if(!realElement.includes("src=") && !realElement.includes("<source")) {
            continue
        } else if(realElement.includes("src=") && !realElement.includes("<source")) {
            // get the video data
            realElement = realElement.split(">")[0]
            videolist.push({
                id: (realElement.match(/id="([^"]*)"/) || [])[1] || "",
                alt: (realElement.match(/alt="([^"]*)"/) || [])[1] || "",
                width: ((realElement.match(/width="([^"]*)"/) || [])[1] || "").replace("px", "").replace("%", "").split('.')[0].split(',')[0],
                height: ((realElement.match(/height="([^"]*)"/) || [])[1] || "").replace("px", "").replace("%", "").split('.')[0].split(',')[0],
                sources: [
                    {
                        src: (realElement.match(/src="([^"]*)"/) || [])[1] || "",
                        type: (realElement.match(/type="([^"]*)"/) || [])[1] || "",
                    }
                ]
            })
        } else if(realElement.includes("<source")){
            let sources = []
            let list = realElement.split("<source").slice(1)

            for(let l = 0; l< list.length; l++){
                sources.push({
                    src: (list[l].match(/src="([^"]*)"/) || [])[1] || "",
                    type: (list[l].match(/type="([^"]*)"/) || [])[1] || "",
                })
            }
            realElement = realElement.split(">")[0]

            let data = {
                id: (realElement.match(/id="([^"]*)"/) || [])[1] || "",
                alt: (realElement.match(/alt="([^"]*)"/) || [])[1] || "",
                width: ((realElement.match(/width="([^"]*)"/) || [])[1] || "").replace("px", "").replace("%", "").split('.')[0].split(',')[0],
                height: ((realElement.match(/height="([^"]*)"/) || [])[1] || "").replace("px", "").replace("%", "").split('.')[0].split(',')[0],
                sources: sources
            }

            if(data.width == NaN) data.width = 0
            if(data.height == NaN) data.height = 0

            videolist.push()
        }
    }

    return videolist
}