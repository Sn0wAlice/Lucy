const fs = require('fs')
const database = require('./main.js')


/**
 * Use this file to create the database migration & integrity check
 */

module.exports = async function migrate() {
    console.log('info', 'database', 'starting the database migration', "", true)
    const schema = JSON.parse(fs.readFileSync('./database/schema.json', 'utf8'))
    console.log('info', 'database', `schema loaded with ${schema.length} databases`, "", true)

    for(const d of schema) {
        // for all databases
        const databaseExist = await database.checkDatabaseExist(d.database)
        if(databaseExist.length === 0) {
            await database.createDatabase(d.database)
            console.log('info', 'database', `database ${d.database} created`, "", true)
        }
    
        for(const t of d.tables) {
            // for all tables
            const tableExist = await database.checkTableExist(d.database, t.name)
            if(tableExist.length === 0) {
                const config = await database.buildString(t.columns)
                await database.createTable(d.database, t.name, config, t.pk)
                console.log('info', 'database', `table ${t.name} created in database ${d.database}`, "", true)
            }
    
            // check if columns are the same
            const tableColumns = await database.getTableColumn(d.database, t.name)
            
            // delete unneeded columns (reverse for ttl columns)
            for(let i = tableColumns.length - 1; i >= 0; i--) {
                if(t.columns.find((e) => e.name === tableColumns[i].name) === undefined) {
                    await database.query(`ALTER TABLE ${d.database}.${t.name} DROP COLUMN ${tableColumns[i].name}`)
                    console.log('info', 'database', `column ${tableColumns[i].name} deleted in table ${t.name} in database ${d.database}`, "", true)
                }
            }
    
    
            // add new columns
            for(const c of t.columns) {
                if(tableColumns.find((e) => e.name === c.name) === undefined) {
                    await database.query(`ALTER TABLE ${d.database}.${t.name} ADD COLUMN ${c.name} ${c.type}`)
                    console.log('info', 'database', `column ${c.name} added in table ${t.name} in database ${d.database}`, "", true)
                }
            }
        }
    }
    console.log('info', 'database', 'database migration finished')
}