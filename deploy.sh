#!/bin/bash

# Production Deployment Script for Peakfolk
set -e

echo "🚀 Starting Peakfolk production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Type check
echo "🔍 Running type check..."
npm run type-check

# Build the application
echo "🏗️ Building application..."
npm run build

# Run tests if available
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    echo "🧪 Running tests..."
    npm test
fi

# Create production bundle
echo "📦 Creating production bundle..."
tar -czf peakfolk-production-$(date +%Y%m%d-%H%M%S).tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    --exclude='.env*' \
    .

echo "✅ Production deployment package created successfully!"
echo "📋 Next steps:"
echo "   1. Upload the tar.gz file to your server"
echo "   2. Extract and run: npm ci --only=production"
echo "   3. Start the application: npm start"
echo "   4. Set up nginx with the provided nginx.conf"
echo "   5. Configure your domain and SSL certificates"

# Optional: Docker build
if command -v docker &> /dev/null; then
    echo "🐳 Building Docker image..."
    docker build -t peakfolk:latest .
    echo "✅ Docker image built successfully!"
    echo "   Run with: docker run -p 3000:3000 peakfolk:latest"
fi

echo "🎉 Deployment preparation complete!" 