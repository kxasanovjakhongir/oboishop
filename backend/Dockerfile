FROM node:20-alpine

WORKDIR /app

# Install deps first so this layer is cached unless package*.json changes.
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# uploads/ is mounted as a volume in docker-compose, but create it here too
# so a standalone `docker run` (without the volume) still works.
RUN mkdir -p uploads/images uploads/textures && \
    addgroup -S app && adduser -S app -G app && \
    chown -R app:app /app
USER app

ENV NODE_ENV=production
EXPOSE 8004

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8004}/health || exit 1

CMD ["node", "server.js"]
