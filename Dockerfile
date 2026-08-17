# ---- Build client (Vite + React) ----
FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build
# output: /app/client/dist

# ---- Build server (Express + TS) ----
FROM node:20-slim AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
# make sure server/tsconfig.json exists (outDir: dist, rootDir: src) before this runs
RUN npm run build
# output: /app/server/dist/server.js

# ---- Runtime ----
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install only production deps for the server
COPY server/package*.json ./
RUN npm ci --omit=dev

# Bring in compiled server and built client
COPY --from=server-build /app/server/dist ./dist
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 8080
CMD ["node", "dist/server.js"]