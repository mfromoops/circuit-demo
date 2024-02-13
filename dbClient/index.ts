import { Hono } from "hono";
import { db, type UserWithAddress } from "./init";
const app = new Hono();
app.get('/users', async (c) => {
    const users = (await db.prepare('SELECT * FROM users')).all();
    console.log(users)
    return new Response(JSON.stringify(users ?? []), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
});
app.get('/users/:id', async (c) => {
    const id = await c.req.path.split('/')[2];
    const user = (await db.prepare('SELECT * FROM users WHERE id = ?').get(id)) as UserWithAddress;
    const addresses = (await db.prepare('SELECT * FROM address_book WHERE user_id = ?').all(id));
    return new Response(JSON.stringify({
        user,
        addresses
    }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
});

app.post('/users/:id/address', async (c) => {   
    const id = await c.req.path.split('/')[2];
    const address: {addressLineOne: string, addressLineTwo: string, latitute: string, longitude: string} = await c.req.json();
    console.log(address)
    const query = await db.prepare('INSERT INTO address_book (user_id, addressLineOne, addressLineTwo, latitute, longitude) VALUES (?, ?, ?, ?, ?)').all(id, address.addressLineOne, address.addressLineTwo, address.latitute, address.longitude);
    console.log(query)
    return new Response('Address added', {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
});

app.post('/users', async (c) => {
    const user: UserWithAddress = await c.req.json();
    const users = await db.prepare('INSERT INTO users (name, email) VALUES (?, ?) RETURNING id').all(user.name, user.email) as UserWithAddress[];
    const address = await db.prepare('INSERT INTO address_book (user_id, addressLineOne, addressLineTwo) VALUES (?, ?, ?) RETURNING id').all(users[0].id, user.addressLineOne, user.addressLineTwo);
    return new Response(JSON.stringify(users[0]));
});

app.get('/address-book', async (c) => {
    const address = await db.prepare('SELECT u.*, ab.addressLineOne, ab.addressLineTwo, ab.latitute, ab.longitude FROM address_book as ab inner join users as u on ab.user_id = u.id').all();
    return new Response(JSON.stringify(address ?? []), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
});

app.post('/address-book', async (c) => {
    const address: {user_id: number, address: string} = await c.req.json();
    await db.prepare('INSERT INTO address_book (user_id, address) VALUES (?, ?) RETURNING id').all(address.user_id, address.address);
    return new Response('Address added', {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
});
console.log('Server running on port 3005');
Bun.serve({
    port: 3005,
    fetch: app.fetch.bind(app)
})




