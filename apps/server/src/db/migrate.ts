import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const migrationClient = postgres('postgresql://localhost:5432/blogdb', {max: 1})

async function main(){
    try{
        await migrate(drizzle(migrationClient), {
            migrationsFolder: 'drizzle'
        })
    } catch (e){
        console.error("error while migrating database is", e)
        process.exit(1)
    } finally {
        await migrationClient.end()
    }
}