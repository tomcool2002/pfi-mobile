import * as SQLite from "expo-sqlite"; 

class Connection {
    constructor(databaseName) {
        this.db = SQLite.openDatabase(databaseName);
        this.transacting = false;
    }

    execute(sqlStatement, args = []) {
        return new Promise((resolve, reject) => {
            this.db.exec([{sql: sqlStatement, args}], false, (err, res) => {
                if (err) {
                    return reject(err);
                }

                if (res[0].error) {
                    return reject(res[0].error);
                }

                resolve(res[0]);
            });
        });
    }

    close() {
        this.db.db.close();
    }

    async beginTransaction() {
        await this.execute("begin transaction");
        this.transacting = true;
    }

    async commitTransaction() {
        await this.execute("commit");
        this.transacting = false;
    }

    async rollbackTransaction() {
        await this.execute("rollback");
        this.transacting = false;
    }
}

export class Database {
    constructor(name = "main", {prepareConnFn, migrateFn} = {}) {
        this.dbName = name;
        this.connection = new Connection(this.dbName);
        this.params = {prepareConnFn, migrateFn};

        this.prepareConnectionPromise =
            typeof this.params.prepareConnFn === "function"
                ? this.params.prepareConnFn(this.connection)
                : Promise.resolve();

        const performMigration = async () => {
            const connection = new Connection(this.dbName);
            await this.params.migrateFn(connection);
            connection.close();
        };

        this.migrationPromise =
            typeof this.params.migrateFn === "function"
                ? performMigration()
                : Promise.resolve();
    }

    async execute(sqlQuery, args = []) {
        await this.prepareConnectionPromise;
        await this.migrationPromise;

        return await this.connection.execute(sqlQuery, args);
    }

    async transaction(cb) {
        await this.prepareConnectionPromise;
        await this.migrationPromise;
        const connection = new Connection(this.dbName);
        if (typeof this.params.prepareConnFn === "function") {
            await this.params.prepareConnFn(connection);
        }
        try {
            await connection.beginTransaction();
            try {
                await cb(connection);
                await connection.commitTransaction();
            } catch (e) {
                await connection.rollbackTransaction();
                throw e;
            }
        } catch (e) {
            connection.close();
            throw e;
        }
        await connection.close();
    }

    close() {
        this.connection.db.close();
    }
}
