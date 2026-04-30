#!/bin/bash

echo "Setting up database schema..."
npx prisma migrate dev --name init

echo "Generating Prisma Client..."
npx prisma generate

echo "Database setup complete!"
