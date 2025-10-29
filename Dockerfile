# --- Builder ---
FROM node:18-alpine AS builder
WORKDIR /app
# Copy only package.json first for better caching; lockfiles are optional here
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# --- Runner ---
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js
EXPOSE 3000
CMD ["npm", "start"]
