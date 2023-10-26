const database = require('./main.js')

module.exports = async function() {
    return await database.getnewurl()
}