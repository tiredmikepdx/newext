# Contributing to Bambu Studio MCP Server

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:
1. Check if the issue already exists in the GitHub Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment (Node.js version, OS, Claude Desktop version)

### Suggesting Enhancements

We welcome suggestions for new features or improvements:
- Open an issue with the "enhancement" label
- Describe the use case and benefits
- Provide examples if possible

### Code Contributions

#### Getting Started

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/newext.git
   cd newext
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. **Make your changes**:
   - Edit `src/index.ts` for main logic
   - Follow the existing code style
   - Add TypeScript types where appropriate

2. **Build and test**:
   ```bash
   npm run build
   node dist/index.js
   ```

3. **Test with Claude Desktop**:
   - Update your `claude_desktop_config.json` to point to your local build
   - Restart Claude Desktop
   - Test your changes with real queries

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

#### Code Style Guidelines

- Use TypeScript with strict type checking
- Follow the existing code structure
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose

#### Adding New Tools

To add a new MCP tool:

1. **Define the schema**:
   ```typescript
   const YourToolSchema = z.object({
     param1: z.string(),
     param2: z.number().optional(),
   });
   ```

2. **Add the tool definition**:
   ```typescript
   const tools: Tool[] = [
     // ... existing tools
     {
       name: "your_tool_name",
       description: "Clear description of what the tool does",
       inputSchema: {
         type: "object",
         properties: {
           param1: {
             type: "string",
             description: "Description of param1",
           },
         },
         required: ["param1"],
       },
     },
   ];
   ```

3. **Implement the handler**:
   ```typescript
   async function handleYourTool(params: z.infer<typeof YourToolSchema>): Promise<string> {
     // Your implementation
     return "Result as formatted string";
   }
   ```

4. **Add to request handler**:
   ```typescript
   if (name === "your_tool_name") {
     const parsed = YourToolSchema.parse(args);
     const result = await handleYourTool(parsed);
     return {
       content: [{ type: "text", text: result }],
     };
   }
   ```

#### Testing Checklist

Before submitting a PR, ensure:
- [ ] Code builds without errors (`npm run build`)
- [ ] TypeScript types are correct (no `any` types)
- [ ] Server starts successfully
- [ ] All tools work as expected in Claude Desktop
- [ ] Documentation is updated if needed
- [ ] Code follows existing style patterns

### Pull Request Process

1. **Update documentation**:
   - Update README.md if adding features
   - Add examples of using new tools
   - Update version in package.json if appropriate

2. **Create the PR**:
   - Push your branch to your fork
   - Create a Pull Request on GitHub
   - Use a clear title and description
   - Reference any related issues

3. **PR description should include**:
   - What changes were made
   - Why the changes are needed
   - How to test the changes
   - Screenshots (if applicable)

4. **Wait for review**:
   - Maintainers will review your PR
   - Address any feedback or questions
   - Make requested changes if needed

## Content Guidelines

### Adding Troubleshooting Information

When adding troubleshooting content:
- Provide clear problem descriptions
- Offer step-by-step solutions
- Include multiple possible causes
- Add Bambu-specific tips when relevant
- Use proper markdown formatting

### Adding Material Information

When adding material recommendations:
- Include print temperature ranges
- Specify print speed recommendations
- Mention special requirements (enclosure, etc.)
- Provide use cases and applications
- Compare to similar materials

### Writing Style

- Use clear, concise language
- Be technically accurate
- Provide practical, actionable advice
- Include examples when helpful
- Format with markdown for readability

## Areas for Contribution

Here are some areas where contributions would be particularly valuable:

### Content Improvements
- More detailed troubleshooting scenarios
- Additional material profiles
- Advanced calibration guides
- Multi-material printing tips
- AMS-specific guidance

### Feature Additions
- G-code parsing and analysis
- Print cost estimation
- Time estimation improvements
- Profile management tools
- Integration with Bambu Lab APIs

### Documentation
- More usage examples
- Video tutorials
- Troubleshooting flowcharts
- Best practices guides
- Frequently asked questions

### Code Quality
- Unit tests
- Integration tests
- Error handling improvements
- Performance optimizations
- Code refactoring

## Community

- Be respectful and constructive
- Help others when you can
- Share your 3D printing knowledge
- Test and provide feedback on PRs
- Report issues you encounter

## Questions?

If you have questions about contributing:
- Open a GitHub Discussion
- Comment on relevant issues
- Ask in your Pull Request

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make this project better! 🚀
