---
description: Apply Prisma schema changes to the database
---
Use this workflow anytime you make changes to `prisma/schema.prisma`.

1. Generate Prisma client
// turbo
npx prisma generate

2. Push schema to database
// turbo
npx prisma db push
