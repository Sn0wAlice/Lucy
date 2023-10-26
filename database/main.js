// see: https://clickhouse.com/docs/en/integrations/language-clients/javascript

const { createClient } = require('@clickhouse/client');

const fs = require('fs')

const config = JSON.parse((process.argv.includes('--local') ? fs.readFileSync('./local-db.json', 'utf8') : fs.readFileSync('./config.json', 'utf8')))
const client = createClient(config)

let jobtaken = false

class Database {
    constructor() {
        this.client = client
    }

    // Data query

    async createDatabase(name) {
        await this.client.query({
            query: `CREATE DATABASE ${name};`,
        })
    }
    
    /**
     * This function will create a table
     * @param database The name of the database
     * @param name The name of the table
     * @param config The configuration of the table
     * @param pk The primary key of the table
     */
    async createTable(database, name, config, pk) {
        await this.client.query({
            query: `CREATE TABLE ${database}.${name} (${config}) ENGINE = MergeTree PRIMARY KEY (${pk})`,
        })
    }

    async query(query) {
        await this.client.query({
            query: query,
        })
    }

    async request(query) {
        try {
            const t = await this.client.query({
                query: query.replace(/\\/g, "\\"),
                format: 'JSONEachRow',
            })
            return await t.json()
        } catch (error) {
            console.log("----------")
            console.log("Error while requesting")
            console.log(query)
            console.log(error)
            //process.exit(0)
        }
    }

    async insert(table, data) {
        try {
            await this.client.insert({
                table: table,
                values: data,
                format: 'JSONEachRow',
            })
        } catch (error) {
            console.log("---------")
            console.log("Error while inserting in table", table)
            console.log(error)
            //process.exit(0)
        }
    }

    async update(table, data, cond) {
        try {
            await this.client.query({
                query: `ALTER TABLE ${table} UPDATE ${data} WHERE ${cond}`,
            })
        } catch(err){
            console.log("---------")
            console.log("Error while updating table", table)
            console.log("Data:", data)
            console.log("Cond:", cond)
            console.log(err)
        }
    }

    async delete(table, cond) {
        await this.client.query({
            query: `ALTER TABLE ${table} DELETE WHERE ${cond}`,
        })
    }


    // Database scheme query
    async checkDatabaseExist(database) {
        const t = await this.client.query({
            query: `SHOW DATABASES LIKE '${database}'`,
            format: 'JSONEachRow',
        })
        return await t.json()
    }

    async checkTableExist(database, table) {
        const t = await this.client.query({
            query: `SHOW TABLES FROM ${database} LIKE '${table}'`,
            format: 'JSONEachRow',
        })
        return await t.json()
    }

    async getTableColumn(database, table) {
        const t = await this.client.query({
            query: `SELECT * FROM system.columns WHERE database='${database}' AND table='${table}'`,
            format: 'JSONEachRow',
        })
        return await t.json()
    }

    /**
     * This function will build a string from an array of object for the create table query
     * @param tableinfos The array of object
     * @returns The string
     */
    async buildString(tableinfos) {
        let str = ""
        for(const t of tableinfos) {
            str += `${t.name} ${t.type},`
        }        
        return str
    }

    async getnewurl() {
        // we need to select the url that has not been crawled yet
        const t = await this.client.query({
            query: `SELECT * FROM wait ORDER BY priority, RAND() LIMIT 1`,
            format: 'JSONEachRow',
        })
        const d = await t.json()
        if(d.length == 0) {
            const t = await this.client.query({
                query: `SELECT * FROM url LIMIT 1`,
                format: 'JSONEachRow',
            }) 
            let t2 = await t.json()
            if(t2.length == 0) {
                if(!jobtaken) {
                    jobtaken = true
                    return [
                        {
                            "fullurl": "http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion/onions/",
                            "priority": 0
                        }
                    ]
                }
                return []
            } else {
                return []
            }
        }
        return d
    }

    async deletefromWait(url) {
        try {
            await this.client.query({
                query: `ALTER TABLE wait DELETE WHERE fullurl='${url}'`,
            })
        } catch (error) {
            console.log("---------")
            console.log("Error while deleting from wait table", url)
            console.log(error)
           // process.exit(0)
        }
    }

    async reinject(url) {
        await this.insert("wait", {
            fullurl: url
        })
    }
}

module.exports = new Database()