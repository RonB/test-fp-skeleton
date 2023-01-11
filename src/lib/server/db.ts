import Surreal from 'surrealdb.js';
import { SURREALDB_HOST, SURREALDB_USER, SURREALDB_PASSWORD } from "$env/static/private"
export const db = new Surreal(`${SURREALDB_HOST}/rpc`);

// Signin as a namespace, database, or root user
await db.signin({
    user: SURREALDB_USER,
    pass: SURREALDB_PASSWORD,
});

// use the flying pillow namespace and database
db.use('flying-pillow', 'admin');

export class Data {

    db: Surreal;

    constructor(url: string) {
        this.db = new Surreal(url);
    }

    public async signin(user: string, password: string) {
        await this.db.signin({
            user: user,
            pass: password,
        });
    }

    public open(ns: string, db: string) {
        this.db.use(ns, db);
    }

}

