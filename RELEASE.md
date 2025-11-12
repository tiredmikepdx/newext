# Release Guide

This guide explains how to create a new release of the Bambu Studio MCP Extension.

## Prerequisites

- Node.js 18.0.0 or higher
- npm
- `@anthropic-ai/mcpb` CLI tool installed globally:
  ```bash
  npm install -g @anthropic-ai/mcpb
  ```

## Release Process

### 1. Update Version

Update the version number in these files:

- `package.json` - Update the `version` field
- `manifest.json` - Update the `version` field
- `src/index.ts` - Update the version in the Server initialization (line 42)

Make sure all three versions match (e.g., `1.0.0` → `1.1.0`).

### 2. Update Changelog

Update `README.md` changelog section with:
- New version number
- Release date
- List of changes/features

### 3. Commit Version Changes

```bash
git add package.json manifest.json src/index.ts README.md
git commit -m "Bump version to 1.1.0"
git push
```

### 4. Build the Extension

Run the build script:

```bash
./scripts/build-extension.sh
```

Or build manually:

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Validate manifest
mcpb validate manifest.json

# Create package
mcpb pack . bambu-studio-mcp.mcpb
```

This will create `bambu-studio-mcp.mcpb` in the project root.

### 5. Test the Package Locally

1. **Unpack and verify**:
   ```bash
   mkdir -p /tmp/test-mcpb
   mcpb unpack bambu-studio-mcp.mcpb /tmp/test-mcpb
   cd /tmp/test-mcpb
   node dist/index.js  # Should start the server
   ```

2. **Test in Claude Desktop** (optional):
   - Double-click the `.mcpb` file to install
   - Test the extension with example queries
   - Uninstall after testing

### 6. Create GitHub Release

1. **Go to GitHub Releases**:
   - Visit https://github.com/tiredmikepdx/newext/releases
   - Click "Create a new release"

2. **Fill in Release Details**:
   - **Tag**: `v1.1.0` (create new tag)
   - **Title**: `Bambu Studio MCP v1.1.0`
   - **Description**: Copy from changelog, include:
     - What's new
     - Installation instructions
     - Known issues (if any)

3. **Upload the Package**:
   - Drag and drop `bambu-studio-mcp.mcpb` into the release
   - The file will be attached to the release

4. **Publish Release**:
   - Check "Set as the latest release"
   - Click "Publish release"

### 7. Verify Release

1. Check that the `.mcpb` file is available for download
2. Download and test the release package
3. Update any documentation links if needed

## Release Checklist

Before publishing a release, ensure:

- [ ] Version numbers updated in all files
- [ ] Changelog updated
- [ ] Code builds without errors (`npm run build`)
- [ ] Manifest validates (`mcpb validate manifest.json`)
- [ ] Package creates successfully (`mcpb pack`)
- [ ] Server starts without errors
- [ ] All tools work as expected
- [ ] Documentation is up to date
- [ ] .mcpb package tested locally
- [ ] GitHub release created with package attached

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## Troubleshooting

### Package too large

If the package exceeds 5MB:
1. Check `.mcpbignore` is properly configured
2. Remove unnecessary files from distribution
3. Consider excluding development dependencies

### Manifest validation fails

Common issues:
- Invalid JSON syntax
- Missing required fields
- Incorrect version format
- Invalid compatibility constraints

Run `mcpb validate manifest.json` for detailed errors.

### Server doesn't start

Check:
- All dependencies are included in `node_modules/`
- Entry point path is correct in `manifest.json`
- No syntax errors in compiled `dist/index.js`
- Node.js version compatibility

## Post-Release

After releasing:

1. **Announce the release**:
   - Post in relevant communities
   - Update project README if needed
   - Share on social media (optional)

2. **Monitor for issues**:
   - Watch GitHub issues
   - Check for user feedback
   - Address critical bugs quickly

3. **Plan next release**:
   - Document feature requests
   - Create milestone for next version
   - Prioritize improvements

## Support

For help with the release process:
- Open an issue on GitHub
- Check the [MCP Bundle documentation](https://github.com/modelcontextprotocol/mcpb)
- Review the [manifest specification](https://github.com/modelcontextprotocol/mcpb/blob/main/MANIFEST.md)
