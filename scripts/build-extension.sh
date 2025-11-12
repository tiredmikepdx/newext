#!/bin/bash
# Build script for Bambu Studio MCP Extension
# This script builds the extension and creates the .mcpb package

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Bambu Studio MCP Extension Build${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Step 1: Clean previous builds
echo -e "${GREEN}Step 1: Cleaning previous builds...${NC}"
rm -rf dist/
rm -f bambu-studio-mcp*.mcpb
echo "  ✓ Cleaned"

# Step 2: Install dependencies
echo ""
echo -e "${GREEN}Step 2: Installing dependencies...${NC}"
npm install
echo "  ✓ Dependencies installed"

# Step 3: Build TypeScript
echo ""
echo -e "${GREEN}Step 3: Building TypeScript...${NC}"
npm run build
echo "  ✓ TypeScript compiled"

# Step 4: Validate manifest
echo ""
echo -e "${GREEN}Step 4: Validating manifest...${NC}"
if command -v mcpb &> /dev/null; then
    mcpb validate manifest.json
    echo "  ✓ Manifest validated"
else
    echo -e "${RED}  ⚠ mcpb CLI not found. Install with: npm install -g @anthropic-ai/mcpb${NC}"
    echo "  Skipping validation..."
fi

# Step 5: Create .mcpb package
echo ""
echo -e "${GREEN}Step 5: Creating .mcpb package...${NC}"
if command -v mcpb &> /dev/null; then
    mcpb pack . bambu-studio-mcp.mcpb
    echo "  ✓ Package created"
    
    # Show package info
    echo ""
    echo -e "${BLUE}Package Details:${NC}"
    ls -lh bambu-studio-mcp*.mcpb | awk '{print "  Size: " $5 "\n  File: " $9}'
else
    echo -e "${RED}  ✗ mcpb CLI not found${NC}"
    echo -e "${RED}  Install with: npm install -g @anthropic-ai/mcpb${NC}"
    exit 1
fi

# Step 6: Test the server
echo ""
echo -e "${GREEN}Step 6: Testing server startup...${NC}"
if timeout 2 node dist/index.js 2>&1 | grep -q "Bambu Studio MCP Server running"; then
    echo "  ✓ Server starts successfully"
else
    echo -e "${RED}  ✗ Server failed to start${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Build Complete! ✓${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Extension package ready for distribution:"
echo "  📦 bambu-studio-mcp.mcpb"
echo ""
echo "Next steps:"
echo "  1. Test locally: Double-click the .mcpb file"
echo "  2. Create a release: Add the .mcpb file to GitHub releases"
echo ""
