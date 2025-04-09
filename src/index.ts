#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://api.geminiflash2.com/v1/generate';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

class CodeFixServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'code-fix-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'analyze_error',
          description: 'Analyze a code error and provide explanation',
          inputSchema: {
            type: 'object',
            properties: {
              errorMessage: { type: 'string', description: 'Error message or stack trace' },
              language: { type: 'string', description: 'Programming language' },
              framework: { type: 'string', description: 'Framework or library (optional)' },
            },
            required: ['errorMessage', 'language'],
          },
        },
        {
          name: 'suggest_fix',
          description: 'Suggest step-by-step resolution for a code error',
          inputSchema: {
            type: 'object',
            properties: {
              errorMessage: { type: 'string', description: 'Error message or stack trace' },
              language: { type: 'string', description: 'Programming language' },
              framework: { type: 'string', description: 'Framework or library (optional)' },
            },
            required: ['errorMessage', 'language'],
          },
        },
        {
          name: 'generate_corrected_code',
          description: 'Generate corrected code snippet based on error',
          inputSchema: {
            type: 'object',
            properties: {
              errorMessage: { type: 'string', description: 'Error message or stack trace' },
              codeSnippet: { type: 'string', description: 'Original code snippet' },
              language: { type: 'string', description: 'Programming language' },
              framework: { type: 'string', description: 'Framework or library (optional)' },
            },
            required: ['errorMessage', 'codeSnippet', 'language'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_error':
            return await this.handleAnalyzeError(args);
          case 'suggest_fix':
            return await this.handleSuggestFix(args);
          case 'generate_corrected_code':
            return await this.handleGenerateCorrectedCode(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async callGemini(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        GEMINI_API_URL,
        { prompt },
        {
          headers: {
            'Authorization': `Bearer ${GEMINI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data?.text || 'No response from Gemini AI.';
    } catch (error: any) {
      console.error('Gemini API error:', error.message);
      return 'Error contacting Gemini AI model.';
    }
  }

  private async handleAnalyzeError(args: any) {
    const { errorMessage, language, framework } = args;
    const prompt = `Explain the following error in ${language}${framework ? ' using ' + framework : ''}:\n${errorMessage}`;
    const explanation = await this.callGemini(prompt);
    return {
      content: [
        { type: 'text', text: explanation },
      ],
    };
  }

  private async handleSuggestFix(args: any) {
    const { errorMessage, language, framework } = args;
    const prompt = `Provide step-by-step instructions to fix this error in ${language}${framework ? ' using ' + framework : ''}:\n${errorMessage}`;
    const steps = await this.callGemini(prompt);
    return {
      content: [
        { type: 'text', text: steps },
      ],
    };
  }

  private async handleGenerateCorrectedCode(args: any) {
    const { errorMessage, codeSnippet, language, framework } = args;
    const prompt = `Given this ${language}${framework ? ' using ' + framework : ''} code snippet with an error:\n${codeSnippet}\n\nError:\n${errorMessage}\n\nProvide the corrected code:`;
    const correctedCode = await this.callGemini(prompt);
    return {
      content: [
        { type: 'text', text: correctedCode },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Code Fix MCP server running on stdio');
  }
}

const server = new CodeFixServer();
server.run().catch(console.error);
