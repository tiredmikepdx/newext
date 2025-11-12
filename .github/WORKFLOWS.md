# GitHub Actions Workflows

This document describes the GitHub Actions workflows configured for the Bambu Studio MCP Extension.

## Overview

The project uses GitHub Actions to automate building, testing, and releasing the extension for Windows installation. All workflows are cross-platform compatible but are optimized for Windows deployment.

## Workflows

### 1. Build and Test (`build-and-test.yml`)

**Trigger**: Push or Pull Request to `main` or `develop` branches

**Purpose**: Validates that the extension builds correctly across all supported platforms.

**What it does**:
- Tests on Windows, macOS, and Linux
- Validates with Node.js 18.x and 20.x
- Installs dependencies
- Builds TypeScript code
- Tests server startup
- Uploads Windows build artifacts

**Matrix Strategy**:
```yaml
os: [ubuntu-latest, windows-latest, macos-latest]
node-version: [18.x, 20.x]
```

**When to use**: Automatically runs on every push and PR. No manual action needed.

---

### 2. Build Windows Package (`build-package.yml`)

**Trigger**: 
- Manual workflow dispatch (can be triggered from GitHub Actions UI)
- Push to `main` branch when source files change
- Changes to: `src/**`, `package.json`, `manifest.json`, `tsconfig.json`

**Purpose**: Creates the `.mcpb` package for Windows installation without creating a release.

**What it does**:
- Builds on Windows (for optimal compatibility)
- Installs dependencies
- Compiles TypeScript
- Installs mcpb CLI tool
- Validates manifest
- Creates `.mcpb` package
- Tests the packaged server
- Uploads package as workflow artifact (30-day retention)
- Generates build summary

**How to trigger manually**:
1. Go to [Actions tab](https://github.com/tiredmikepdx/newext/actions)
2. Select "Build Windows Package"
3. Click "Run workflow"
4. Choose branch (usually `main`)
5. Click "Run workflow" button

**Artifacts**: Downloads available for 30 days from workflow run page.

**When to use**: 
- Testing package creation before a release
- Creating development builds for testing
- Validating changes to build process

---

### 3. Release (`release.yml`)

**Trigger**: Push of version tags (e.g., `v1.0.0`, `v1.1.0`)

**Purpose**: Automatically creates GitHub releases with the `.mcpb` package attached.

**What it does**:
- Builds on Windows (for release consistency)
- Installs dependencies
- Compiles TypeScript
- Installs mcpb CLI tool
- Validates manifest
- Creates `.mcpb` package
- Tests package creation
- Creates GitHub release with:
  - Version extracted from tag
  - Pre-filled release notes
  - `.mcpb` package as downloadable asset
  - Installation instructions

**How to trigger**:
```bash
# After committing version bump
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

**Release Template**: Automatically includes:
- Installation instructions
- Requirements
- Support links

**When to use**: Creating official releases for users to download.

---

## Workflow Dependencies

All workflows use:
- `actions/checkout@v4` - Check out repository code
- `actions/setup-node@v4` - Set up Node.js environment
- `npm ci` - Clean install dependencies (faster, more reliable than `npm install`)

Release workflows additionally use:
- `actions/create-release@v1` - Create GitHub release
- `actions/upload-release-asset@v1` - Upload `.mcpb` file to release
- `actions/upload-artifact@v4` - Upload build artifacts

## Environment Requirements

### Node.js Version
- Primary: Node.js 20.x (LTS)
- Compatible: Node.js 18.x+

### Build Tools
- npm (comes with Node.js)
- TypeScript (dev dependency)
- @anthropic-ai/mcpb CLI (installed during workflow)

### Platform Support
- **Primary**: Windows (release builds)
- **Validated**: macOS, Linux (CI builds)

## Secrets and Tokens

**GITHUB_TOKEN**: Automatically provided by GitHub Actions
- Used for creating releases
- Used for uploading release assets
- No configuration needed

## Artifact Retention

- Build artifacts: 7 days
- Package artifacts: 30 days
- Release assets: Permanent (until manually deleted)

## Best Practices

### For Contributors

1. **Always run Build and Test first**: The workflow automatically runs on PRs
2. **Test locally before pushing**: Run `npm run build` to catch issues early
3. **Keep workflows updated**: Update action versions when security updates are available

### For Maintainers

1. **Use automated releases**: Prefer tag-based releases over manual uploads
2. **Test package workflow**: Run manually before creating official releases
3. **Monitor workflow runs**: Check Actions tab for failures
4. **Update release notes**: Edit auto-generated release notes with actual changes

### Version Tagging

Follow semantic versioning for tags:
```bash
# Patch release (bug fixes)
git tag -a v1.0.1 -m "Bug fix release"

# Minor release (new features, backward compatible)
git tag -a v1.1.0 -m "Feature release"

# Major release (breaking changes)
git tag -a v2.0.0 -m "Major version release"
```

Always push tags explicitly:
```bash
git push origin v1.1.0
```

## Troubleshooting

### Build Fails on Windows but Works Locally

**Possible causes**:
- Path separator differences (use `/` or `path.join()`)
- Case-sensitive file references
- Missing dependencies in `package.json`

**Solution**: Test with `npm ci` instead of `npm install` locally

### Package Creation Fails

**Check**:
1. Is `manifest.json` valid? Run `mcpb validate manifest.json`
2. Are required files in `.mcpbignore`? Review exclusions
3. Is package too large? Check `.mcpbignore` settings

### Release Not Created

**Check**:
1. Tag format: Must be `v*` (e.g., `v1.0.0`, not `1.0.0`)
2. Tag pushed to remote: `git push origin v1.0.0`
3. Workflow permissions: Check repo settings → Actions → Workflow permissions

### Workflow Doesn't Trigger

**Check**:
1. Branch names match trigger conditions
2. File paths match path filters
3. Workflow file has correct YAML syntax
4. Actions are enabled for the repository

## Monitoring and Logs

### View Workflow Runs
1. Go to repository → Actions tab
2. Select workflow from left sidebar
3. Click on specific run to see details

### Download Artifacts
1. Open workflow run
2. Scroll to "Artifacts" section
3. Click artifact name to download

### Check Build Logs
1. Open workflow run
2. Click on job name (e.g., "Build on windows-latest")
3. Click on step to see detailed logs

## Future Enhancements

Potential workflow improvements:
- [ ] Add automated testing with test fixtures
- [ ] Integrate code quality checks (linting, type checking)
- [ ] Add security scanning (npm audit, CodeQL)
- [ ] Create preview releases for beta testing
- [ ] Add changelog generation from commits
- [ ] Implement automatic version bumping
- [ ] Add notification on release (Discord, Slack, email)
- [ ] Create multi-platform releases (if needed)

## Related Documentation

- [Release Guide](../RELEASE.md) - How to create releases
- [Installation Guide](../INSTALLATION.md) - User installation instructions
- [Contributing Guide](../CONTRIBUTING.md) - Developer contribution guidelines
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MCPB CLI Documentation](https://github.com/modelcontextprotocol/mcpb)

## Support

For issues with workflows:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Open an issue with:
   - Workflow name
   - Run ID or link
   - Error messages
   - Expected vs actual behavior
