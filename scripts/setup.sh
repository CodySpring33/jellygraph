#!/bin/bash

# Jellyfin Analytics Dashboard Setup Script

echo "🚀 Setting up Jellyfin Analytics Dashboard..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data logs

# Copy environment template
echo "🔧 Setting up environment configuration..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit .env file with your Jellyfin server details"
else
    echo "ℹ️  .env file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️  Setting up database..."
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Jellyfin server URL and API key"
echo "2. Run 'npm run dev' to start in development mode"
echo "3. Or run 'docker-compose up --build' to start with Docker"
echo ""
echo "Dashboard will be available at: http://localhost:3000"
