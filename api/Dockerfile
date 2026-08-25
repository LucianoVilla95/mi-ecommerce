# --- ETAPA 1: Construcción (Build) ---
FROM node:24.13.0 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production


# --- ETAPA 2: Producción (Runner) ---
FROM node:24.13.0 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]