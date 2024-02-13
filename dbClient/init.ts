import { Database } from "bun:sqlite";
const db = new Database('db.sqlite');
export type UserWithAddress ={
    id: string;
    name: string;
    email: string;
    addressLineOne: string;
    addressLineTwo: string;
  };
// drop tables
// await db.run('DROP TABLE IF EXISTS users');
// await db.run('DROP TABLE IF EXISTS address_book');
await db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)');
// address_book table with a foreign key to users
await db.run('CREATE TABLE IF NOT EXISTS address_book (id INTEGER PRIMARY KEY, user_id INTEGER, addressLineOne TEXT, addressLineTwo TEXT, latitute TEXT, longitude TEXT, FOREIGN KEY(user_id) REFERENCES users(id))');
// Insert some initial data into the users table
// await db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run('Alice', 'alice@alice.com');
// Insert some initial data into the address_book table for user with id 2
// await db.prepare('INSERT INTO address_book (user_id, addressLineOne, addressLineTwo) VALUES (?, ?, ?)').run(1, '87 Carr 20', 'Guaynabo, PR, 00966');


export { db };

