# API Testing Backend

A tiny Express + TypeScript backend for testing API clients such as Apirquest. Data is stored in `data/db.json`, so you do not need MongoDB, MySQL, Docker, or any other database server.

## Requirements

- Node.js 18 or newer
- npm

## Run it

```bash
npm install
npm run dev
```

The server starts at `http://localhost:3000`.

For a production-style run:

```bash
npm run build
npm start
```

Set a different port with `PORT=4000 npm run dev` if needed.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| GET | `/api/items` | List all items |
| GET | `/api/items?search=express` | Filter items by name/description |
| GET | `/api/items/:id` | Get one item |
| POST | `/api/items` | Create an item |
| PUT | `/api/items/:id` | Replace an item's editable fields |
| PATCH | `/api/items/:id` | Update supplied fields only |
| DELETE | `/api/items/:id` | Delete an item |
| ALL | `/api/echo` | Inspect method, query, headers, and body |
| GET | `/api/protected` | Test a required request header |
| GET | `/api/delay?ms=1500` | Test request timeouts |
| GET | `/api/error?status=418` | Ask the server to return an HTTP error |

## Quick tests

### GET — list items

```bash
curl http://localhost:3000/api/items
```

### POST — create an item

Header: `Content-Type: application/json`

```bash
curl -X POST http://localhost:3000/api/items \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test my API","description":"Created from a request client"}'
```

Copy the returned `data.id` for the next requests.

### PUT — replace an item

```bash
curl -X PUT http://localhost:3000/api/items/ITEM_ID \
  -H 'Content-Type: application/json' \
  -d '{"name":"Updated item","description":"Replaced with PUT"}'
```

### PATCH — update one field

```bash
curl -X PATCH http://localhost:3000/api/items/ITEM_ID \
  -H 'Content-Type: application/json' \
  -d '{"description":"Changed with PATCH"}'
```

### DELETE — remove an item

```bash
curl -X DELETE http://localhost:3000/api/items/ITEM_ID
```

### Query parameters and headers

```bash
curl 'http://localhost:3000/api/items?search=express'
curl 'http://localhost:3000/api/echo?hello=world&page=2' \
  -H 'x-demo-header: apirquest'
```

### Test a header-protected route

Without the header, this returns `401`:

```bash
curl http://localhost:3000/api/protected
```

With the correct header, it returns `200`:

```bash
curl http://localhost:3000/api/protected -H 'x-api-key: test-secret'
```

### Test timeout and error handling

```bash
curl 'http://localhost:3000/api/delay?ms=3000'
curl 'http://localhost:3000/api/error?status=418'
curl http://localhost:3000/api/items/does-not-exist
```

The last request returns `404`. Creating an item without `name` returns `400`.

## Notes

- `data/db.json` is the local file database. Changes persist after restarting the server.
- This is for local development and API-client testing, not production use. It has no database concurrency controls or real authentication system.
- To reset the sample data, stop the server and replace `data/db.json` with `[]` or restore the original file from version control.
# github-actions
