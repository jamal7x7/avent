Ensure a Clean Database State
If you haven’t already, run:

```sh

dropdb avent
createdb avent

```

This will reset your database (all data will be lost).

2. Run Migrations
Apply all Drizzle migrations to create the tables:

```sh

pnpm db:migrate

```

Watch for errors. If you see errors like "already exists," your DB is not clean or the migration state is out of sync.

3. Confirm Table Existence
You can check tables exist using psql:

```sh

psql -d avent -c '\dt'

```