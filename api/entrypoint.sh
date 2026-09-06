#!/bin/sh

# 1. Ejecutar las migraciones pendientes leyendo directamente los archivos .ts
echo "Ejecutando migraciones en desarrollo con ts-node..."
npm run migration:run

# 2. Arrancar NestJS en modo desarrollo con Hot Reload (--watch)
echo "Iniciando NestJS en modo desarrollo..."
exec npm run start:dev
