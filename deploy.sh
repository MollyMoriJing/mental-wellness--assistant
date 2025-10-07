#!/bin/bash

# ⚡ Vercel + Railway Deployment Script
# Alternative to Render - $0/month

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Vercel + Railway Deployment${NC}"
echo "================================"
echo "Frontend: Vercel (FREE)"
echo "Backend: Railway (FREE)"
echo "Total Cost: $0/month"
echo ""

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Committing changes...${NC}"
    git add .
    git commit -m "Deploy to Vercel + Railway"
fi

# Push to GitHub
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push origin main

echo -e "${YELLOW}🚀 Step 1: Deploying Frontend to Vercel...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy frontend to Vercel
cd frontend
echo "Deploying to Vercel..."
vercel --prod --yes

# Get the Vercel URL
VERCEL_URL=$(vercel ls | head -2 | tail -1 | awk '{print $2}')
echo -e "${GREEN}✅ Frontend deployed to: https://$VERCEL_URL${NC}"

cd ..

echo -e "${YELLOW}🚀 Step 2: Deploying Backend to Railway...${NC}"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "Logging into Railway..."
railway login

# Deploy backend to Railway
echo "Deploying to Railway..."
railway up

# Get the Railway URL
RAILWAY_URL=$(railway status | grep "https://" | head -1 | awk '{print $2}')
echo -e "${GREEN}✅ Backend deployed to: $RAILWAY_URL${NC}"

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "================================"
echo -e "Frontend: ${GREEN}https://$VERCEL_URL${NC}"
echo -e "Backend:  ${GREEN}$RAILWAY_URL${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update frontend environment variable:"
echo "   VITE_API_URL=$RAILWAY_URL"
echo "2. Add API keys in Railway dashboard"
echo "3. Test your deployed app!"
echo ""
echo -e "${GREEN}💰 Total Cost: $0/month${NC}"
echo -e "${GREEN}⏱️  Total Time: ~5 minutes${NC}"
