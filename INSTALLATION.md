# Installation Guide for Bambu Studio MCP Server

This guide will help you install and configure the Bambu Studio MCP Server for Claude Desktop, even if you're not familiar with development tools.

## Prerequisites

Before you begin, you need:

1. **Node.js** (version 18 or higher)
2. **Claude Desktop** application
3. A computer running Windows, macOS, or Linux

## Step 1: Install Node.js

### Windows
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Follow the installation wizard (accept all defaults)
5. Restart your computer

### macOS
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version for macOS
3. Open the downloaded `.pkg` file
4. Follow the installation wizard
5. Restart your terminal

### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fedora
sudo dnf install nodejs

# Arch
sudo pacman -S nodejs npm
```

### Verify Installation
Open a terminal/command prompt and run:
```bash
node --version
npm --version
```

You should see version numbers (e.g., `v20.11.0` and `10.2.4`).

## Step 2: Download the MCP Server

### Option A: Download ZIP (Easiest)
1. Go to [https://github.com/tiredmikepdx/newext](https://github.com/tiredmikepdx/newext)
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to a permanent location (e.g., `Documents/bambu-mcp`)

### Option B: Clone with Git
If you have Git installed:
```bash
git clone https://github.com/tiredmikepdx/newext.git
cd newext
```

## Step 3: Install and Build

Open a terminal/command prompt in the downloaded folder and run:

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

Wait for both commands to complete. You should see "found 0 vulnerabilities" and no errors.

## Step 4: Configure Claude Desktop

### Find the Config File

The Claude Desktop configuration file is located at:

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```
(Usually: `C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json`)

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux**:
```
~/.config/Claude/claude_desktop_config.json
```

### Edit the Config File

1. **Open the file** in a text editor (Notepad, TextEdit, VS Code, etc.)
   - If the file doesn't exist, create it

2. **Add the configuration**:

If the file is empty or only has `{}`, replace it with:

```json
{
  "mcpServers": {
    "bambu-studio": {
      "command": "node",
      "args": ["/FULL/PATH/TO/newext/dist/index.js"]
    }
  }
}
```

If the file already has content, add the `bambu-studio` entry to the existing `mcpServers` section:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "bambu-studio": {
      "command": "node",
      "args": ["/FULL/PATH/TO/newext/dist/index.js"]
    }
  }
}
```

3. **Replace `/FULL/PATH/TO/newext`** with the actual path:

   **Windows Example**:
   ```json
   "args": ["C:\\Users\\YourName\\Documents\\newext\\dist\\index.js"]
   ```
   (Note: Use double backslashes `\\` in Windows paths)

   **macOS/Linux Example**:
   ```json
   "args": ["/Users/yourname/Documents/newext/dist/index.js"]
   ```

4. **Save the file**

### Get the Full Path

**Windows**:
- Open File Explorer
- Navigate to the `newext` folder
- Click on the address bar (shows the path)
- Copy it and add `\\dist\\index.js`

**macOS**:
- In Finder, right-click the `newext` folder
- Hold Option key and select "Copy as Pathname"
- Add `/dist/index.js` to the end

**Linux**:
```bash
cd /path/to/newext
pwd
# Copy the output and add /dist/index.js
```

## Step 5: Restart Claude Desktop

1. **Quit Claude Desktop completely**
   - Windows: Right-click system tray icon → Quit
   - macOS: Claude → Quit Claude (or Cmd+Q)
   - Linux: File → Quit

2. **Start Claude Desktop again**

3. **Verify the server is loaded**:
   - You might see a notification about the new MCP server
   - Check Claude Desktop's logs if it doesn't appear

## Step 6: Test the Installation

In Claude Desktop, try asking questions like:

- "What's the difference between STL and 3MF files?"
- "What print settings should I use for PETG?"
- "How do I fix first layer adhesion issues?"
- "What material should I use for an outdoor part?"

If Claude can answer these with detailed Bambu Studio information, the installation was successful! 🎉

## Troubleshooting

### Server Doesn't Appear

**Check the config file syntax**:
- Make sure it's valid JSON (no extra commas, matching braces)
- Use a JSON validator: [jsonlint.com](https://jsonlint.com/)

**Verify the path**:
- Make sure the path in `args` points to `dist/index.js`
- Check that the file exists at that location
- Ensure you used the correct path format for your OS

**Check Node.js**:
```bash
node --version
```
Should show v18 or higher

### Server Crashes

**Rebuild the project**:
```bash
cd /path/to/newext
npm install
npm run build
```

**Test the server directly**:
```bash
node dist/index.js
```
Should show: "Bambu Studio MCP Server running on stdio"

**Check for errors**:
- Look in Claude Desktop's logs
- On macOS: `~/Library/Logs/Claude/`
- On Windows: `%APPDATA%\Claude\logs\`

### Permission Issues

**macOS/Linux**:
```bash
chmod +x dist/index.js
```

**Windows**:
- Right-click → Properties → Security
- Ensure your user has Read & Execute permissions

## Updating

To update to a newer version:

1. Download/pull the latest code
2. Run:
   ```bash
   npm install
   npm run build
   ```
3. Restart Claude Desktop

## Uninstalling

1. Remove the `bambu-studio` entry from `claude_desktop_config.json`
2. Restart Claude Desktop
3. Delete the `newext` folder (optional)

## Getting Help

If you're still having trouble:
- Check the [README.md](README.md) for more details
- Open an issue on GitHub
- Include:
  - Your operating system
  - Node.js version (`node --version`)
  - Error messages
  - What you've already tried

---

Happy 3D printing! 🖨️
