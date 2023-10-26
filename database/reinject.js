const database = require('./main.js')

module.exports = async function(link) {
    return await database.reinject(link)
}