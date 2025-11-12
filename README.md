# Bambu Studio MCP Server

A Claude Desktop Extension (Model Context Protocol server) that provides comprehensive 3D printing assistance for Bambu Studio users.

## Overview

This MCP server integrates with Claude Desktop to provide expert guidance on 3D printing workflows, file formats, print settings, troubleshooting, and material selection specifically tailored for Bambu Studio and Bambu Lab 3D printers.

## Features

### 🔧 Tools Available

1. **File Format Information** (`get_file_format_info`)
   - Detailed explanations of STL, 3MF, G-code, OBJ, and STEP formats
   - When to use each format in your workflow
   - Format capabilities and limitations

2. **3MF File Guide** (`get_3mf_info`)
   - Understanding 3MF structure and contents
   - Compatibility between Bambu Studio and other slicers
   - Metadata and embedded settings management
   - Best practices for project files

3. **Print Settings Recommendations** (`recommend_print_settings`)
   - Material-specific temperature and speed guidance
   - Layer height optimization for quality vs. speed
   - Infill recommendations based on use case
   - Print speed tuning for different scenarios

4. **Troubleshooting Assistant** (`troubleshoot_issue`)
   - Common print failures and solutions
   - Quality issues (stringing, layer shifting, warping)
   - Mechanical and electrical problem diagnosis
   - Bambu Studio software troubleshooting

5. **Material Selection Helper** (`select_material`)
   - Choose the right filament for your project
   - PLA, PETG, ABS, ASA, TPU, Nylon comparisons
   - Requirements-based recommendations (strength, heat, flexibility)
   - Application-specific guidance

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- Claude Desktop application
- Bambu Studio (optional, but recommended)

### Method 1: From Source

1. Clone or download this repository:
   ```bash
   git clone https://github.com/tiredmikepdx/newext.git
   cd newext
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Configure Claude Desktop to use this MCP server by editing your Claude Desktop config file:

   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
   **Linux**: `~/.config/Claude/claude_desktop_config.json`

   Add the following configuration:
   ```json
   {
     "mcpServers": {
       "bambu-studio": {
         "command": "node",
         "args": ["/absolute/path/to/newext/dist/index.js"]
       }
     }
   }
   ```

5. Restart Claude Desktop

### Method 2: Using npm (if published)

```bash
npm install -g @tiredmikepdx/bambu-studio-mcp
```

Then configure Claude Desktop with:
```json
{
  "mcpServers": {
    "bambu-studio": {
      "command": "bambu-studio-mcp"
    }
  }
}
```

### Method 3: One-Click Installation (.mcpb) ⭐ **Recommended**

The easiest way to install! No manual configuration needed.

1. **Download the extension package**:
   - Download `bambu-studio-mcp.mcpb` from the [latest release](https://github.com/tiredmikepdx/newext/releases)

2. **Install in Claude Desktop**:
   - **Option A**: Double-click the `.mcpb` file (it will open in Claude Desktop)
   - **Option B**: In Claude Desktop, go to Settings → Extensions → Install Extension and select the file

3. **Done!** The extension is ready to use immediately. No configuration files to edit, no paths to set up.

**Benefits**:
- ✅ Zero configuration required
- ✅ All dependencies bundled
- ✅ Works on macOS, Windows, and Linux
- ✅ Automatic updates through Claude Desktop
- ✅ Easy to uninstall if needed

## Usage Examples

Once installed and configured, you can ask Claude questions like:

### File Formats
- "What's the difference between STL and 3MF files?"
- "When should I use G-code vs 3MF in Bambu Studio?"
- "Explain the 3MF file structure"
- "How do I make my Bambu Studio 3MF files compatible with other slicers?"

### Print Settings
- "What print settings should I use for PETG?"
- "Recommend settings for a detailed miniature"
- "What layer height should I use for functional parts?"
- "Best print speed for PLA on my X1 Carbon?"

### Troubleshooting
- "My first layer isn't sticking to the bed"
- "How do I fix stringing in my prints?"
- "My prints are showing layer shifts - what could be wrong?"
- "The prints from my P1P are warping at the corners"

### Material Selection
- "What material should I use for an outdoor planter?"
- "I need a flexible phone case - which filament?"
- "Best material for heat-resistant automotive parts?"
- "Which filament is food-safe for cookie cutters?"

## Architecture

This MCP server is built using:
- **TypeScript** for type-safe development
- **@modelcontextprotocol/sdk** for MCP protocol implementation
- **Zod** for runtime schema validation
- **stdio transport** for communication with Claude Desktop

### Project Structure

```
newext/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── README.md            # This file
└── LICENSE              # MIT License
```

## Development

### Building
```bash
npm run build
```

### Development Mode (watch for changes)
```bash
npm run dev
```

### Testing
After building, you can test the server directly:
```bash
node dist/index.js
```

The server communicates via stdio, so you'll need to send MCP protocol messages for testing.

### Automated Builds

This project uses GitHub Actions for automated building and releasing:

- **Build and Test**: Automatically runs on every push/PR to validate builds across Windows, macOS, and Linux
- **Windows Package**: Creates `.mcpb` packages automatically or can be triggered manually
- **Releases**: Automatically creates releases with `.mcpb` packages when version tags are pushed

See [Workflow Documentation](.github/WORKFLOWS.md) for details.

## Supported Bambu Lab Printers

This MCP server provides guidance applicable to all Bambu Lab 3D printers, including:
- X1 Series (X1 Carbon, X1E)
- P1 Series (P1P, P1S)
- A1 Series (A1, A1 mini)

## Supported Materials

The server includes detailed recommendations for:
- **PLA** (Standard, PLA+, Silk, Matte, Wood, Specialty)
- **PETG** (Standard and variants)
- **ABS** (Acrylonitrile Butadiene Styrene)
- **ASA** (UV-resistant alternative to ABS)
- **TPU** (Flexible filament)
- **Nylon** (High-strength applications)
- **PC** (Polycarbonate - extreme duty)
- **Composite Materials** (Carbon fiber, etc.)

## Contributing

Contributions are welcome! This is an open-source project under the MIT License.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Ideas for Contributions

- Additional troubleshooting scenarios
- More material recommendations
- Support for additional file formats
- Integration with Bambu Lab's API (if available)
- Custom G-code analysis tools
- Print time estimation helpers
- Cost calculation tools

## Resources

### Bambu Lab Resources
- [Bambu Lab Official Site](https://bambulab.com/)
- [Bambu Studio Download](https://bambulab.com/en/download/studio)
- [Bambu Lab Wiki](https://wiki.bambulab.com/)
- [Bambu Lab Community Forum](https://forum.bambulab.com/)

### MCP Resources
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop Extensions](https://www.anthropic.com/engineering/desktop-extensions)

### 3D Printing Resources
- [3MF Specification](https://github.com/3MFConsortium/spec_core)
- [G-code Reference](https://marlinfw.org/meta/gcode/)

## Troubleshooting

### Server Not Appearing in Claude Desktop

1. Check your `claude_desktop_config.json` syntax is valid JSON
2. Ensure the path to `dist/index.js` is absolute and correct
3. Verify Node.js is in your PATH
4. Restart Claude Desktop completely
5. Check Claude Desktop's logs for errors

### Server Crashes or Errors

1. Ensure you've run `npm install` and `npm run build`
2. Check Node.js version is 18.0.0 or higher
3. Look for error messages in Claude Desktop's developer console
4. Try running the server directly: `node dist/index.js`

### Permission Issues

- On Unix-like systems, ensure the built file is executable
- Check file permissions on the dist directory

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**tiredmikepdx**

## Acknowledgments

- Bambu Lab for creating excellent 3D printers and Bambu Studio
- Anthropic for Claude and the Model Context Protocol
- The 3D printing community for collective knowledge
- Contributors to the 3MF specification

## Changelog

### Version 1.0.0 (Initial Release)
- Five comprehensive tools for 3D printing assistance
- File format information (STL, 3MF, G-code, OBJ, STEP)
- 3MF structure and compatibility guide
- Print settings recommendations by material and requirements
- Troubleshooting for common print issues
- Material selection helper
- Support for all major Bambu Lab printer models

## Roadmap

Future enhancements being considered:
- [ ] G-code parsing and analysis
- [ ] Integration with Bambu Connect API
- [ ] Print time and cost estimation
- [ ] Custom profile management
- [ ] Slicing parameter optimization suggestions
- [ ] Multi-language support
- [ ] Advanced calibration guides
- [ ] Community knowledge base integration

---

**Note**: This is an unofficial community project and is not affiliated with or endorsed by Bambu Lab. All product names, trademarks, and registered trademarks are property of their respective owners.