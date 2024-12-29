# Stage 1: Build Stage
FROM node:23-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only package.json and pnpm-lock.yaml to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile
 
# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN pnpm build

# Stage 2: Production Runner Stage
FROM node:23-alpine AS runner

# Set the working directory
WORKDIR /app

# Install pnpm globally in the runner stage
RUN npm install -g pnpm

# Copy built files and dependencies from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.mjs ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the app using pnpm
CMD ["pnpm", "start"]
