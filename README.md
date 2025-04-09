# Code Fix MCP Server

An MCP (Model Context Protocol) server that helps users analyze code errors, suggests step-by-step fixes, and generates corrected code snippets using AI models like Gemini Flash 2.

## Features

- **Analyze Error:** Understands and explains code errors.
- **Suggest Fix:** Provides step-by-step instructions to resolve errors.
- **Generate Corrected Code:** Produces corrected code snippets based on error context.
- **Supports Multiple Languages and Frameworks**
- **Powered by Gemini Flash 2 AI model**

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure Gemini Flash 2 API:**

Set environment variables:

- `GEMINI_API_URL` (default: `https://api.geminiflash2.com/v1/generate`)
- `GEMINI_API_KEY` (your API key)

Example (PowerShell):

```powershell
$env:GEMINI_API_URL = "https://your-gemini-api-endpoint"
$env:GEMINI_API_KEY = "your_api_key"
```

3. **Build the server:**

```bash
npm run build
```

4. **Run the server:**

```bash
npm start
```

## MCP Tools

- `analyze_error`: Analyze a code error and provide explanation.
- `suggest_fix`: Suggest step-by-step resolution.
- `generate_corrected_code`: Generate corrected code snippet.

## Usage

Connect this server to an MCP-compatible client (e.g., Claude Desktop, custom tool) and invoke the tools with appropriate parameters:

```json
{
  "errorMessage": "TypeError: Cannot read property 'foo' of undefined",
  "language": "JavaScript",
  "framework": "React",
  "codeSnippet": "const bar = foo.bar();"
}
```

## License

MIT
