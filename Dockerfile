# ---- Build stage ----
FROM node:20-slim AS build
WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci
RUN npm --prefix client ci

# Copy source and build both client (Vite) and server (tsc)
COPY . .
RUN npm --prefix client run build      # outputs client/dist
RUN npm run build                      # outputs dist/ (compiled server, e.g. dist/index.js)

# ---- Runtime stage ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled server and built frontend from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist

# Fly.io / most PaaS platforms inject PORT; make sure your server
# listens on process.env.PORT and binds to 0.0.0.0
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]