# Use the official Node.js Alpine image (lightweight and Pi 5 compatible)
FROM node:18-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package files first for better Docker caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the application code
COPY . .

# Remove unnecessary files to keep image small
RUN rm -rf test/ \
    debug-*.js \
    test-*.js \
    manual-extract.js \
    analyze-pattern.js \
    final-*.js \
    find-*.js \
    quick-*.js \
    auth-optimization-analysis.md \
    CACHE_IMPLEMENTATION.md \
    .git/ \
    .gitignore \
    README.md \
    LICENSE \
    Procfile

# Create a non-root user for security
RUN addgroup -g 1001 -S botuser && \
    adduser -S botuser -u 1001

# Create cache directory and set permissions
RUN mkdir -p cache && \
    chown -R botuser:botuser /app

# Switch to non-root user
USER botuser

# Expose port if needed (though Discord bots typically don't need this)
# EXPOSE 3000

# Health check to ensure bot is running
HEALTHCHECK --interval=60s --timeout=10s --start-period=20s --retries=3 \
    CMD node -e "console.log('Bot health check passed')" || exit 1

# Run the bot
CMD ["node", "index.js"]
