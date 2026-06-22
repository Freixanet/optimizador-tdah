FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Install on Linux without the macOS-biased lockfile so Tailwind oxide bindings resolve.
COPY package.json ./
RUN npm install --include=optional

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
