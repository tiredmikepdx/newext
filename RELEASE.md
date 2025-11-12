# Release Guide

This guide explains how to create a new release of the Bambu Studio MCP Extension.

## Automated Release Process (Recommended) ⭐

The easiest way to create a release is using GitHub Actions, which automatically builds and packages the extension for Windows installation.

### Quick Release Steps

1. **Update Version Numbers** (in `package.json`, `manifest.json`, and `src/index.ts`)
2. **Update Changelog** in `README.md`
3. **Commit and Push** changes to `main` branch
4. **Create and Push a Version Tag**:
   ```bash
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push origin v1.1.0
   ```
5. **Done!** GitHub Actions will automatically:
   - Build the TypeScript code
   - Create the `.mcpb` package
   - Create a GitHub release
   - Attach the `.mcpb` file to the release

The release will be available at: `https://github.com/tiredmikepdx/newext/releases`

### Available GitHub Actions Workflows

1. **Build and Test** (`.github/workflows/build-and-test.yml`)
   - Runs automatically on push/PR
   - Tests build on Windows, macOS, and Linux
   - Validates with Node.js 18.x and 20.x

2. **Build Windows Package** (`.github/workflows/build-package.yml`)
   - Creates `.mcpb` package for Windows
   - Can be triggered manually from Actions tab
   - Uploads package as workflow artifact
   - Runs automatically when source files change

3. **Release** (`.github/workflows/release.yml`)
   - Automatically triggered by version tags (e.g., `v1.1.0`)
   - Builds on Windows for optimal compatibility
   - Creates GitHub release with `.mcpb` package attached
   - Includes installation instructions in release notes

---

## Manual Release Process (Advanced)

For developers who prefer manual control or need to troubleshoot the build process.

### Prerequisites

- Node.js 18.0.0 or higher
- npm
- `@anthropic-ai/mcpb` CLI tool installed globally:
  ```bash
  npm install -g @anthropic-ai/mcpb
  ```

## Manual Release Steps

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

## Manual Build Trigger

You can manually trigger the Windows package build workflow without creating a release:

1. Go to the [Actions tab](https://github.com/tiredmikepdx/newext/actions)
2. Select "Build Windows Package" workflow
3. Click "Run workflow" button
4. Select the branch (usually `main`)
5. Click "Run workflow"

The workflow will create the `.mcpb` package and upload it as an artifact that you can download for testing.

## Release Checklist

**For Automated Releases:**
- [ ] Version numbers updated in all files (`package.json`, `manifest.json`, `src/index.ts`)
- [ ] Changelog updated in `README.md`
- [ ] Changes committed and pushed to `main`
- [ ] Version tag created and pushed (e.g., `git tag v1.1.0 && git push origin v1.1.0`)
- [ ] GitHub Actions workflow completed successfully
- [ ] Release appears on GitHub with `.mcpb` file attached

**For Manual Releases:**
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
