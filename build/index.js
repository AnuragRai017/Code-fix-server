#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
class CodeFixServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'code-fix-server',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
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
            }
            catch (error) {
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
    async handleAnalyzeError(args) {
        const { errorMessage, language, framework } = args;
        // Placeholder: Replace with AI model call or static analysis
        const explanation = `Analysis for error in ${language}${framework ? ' with ' + framework : ''}:\n${errorMessage}`;
        return {
            content: [
                {
                    type: 'text',
                    text: explanation,
                },
            ],
        };
    }
    async handleSuggestFix(args) {
        const { errorMessage, language, framework } = args;
        // Placeholder: Replace with AI model call or static analysis
        const steps = `Suggested steps to fix error in ${language}${framework ? ' with ' + framework : ''}:\n1. Understand the error\n2. Check related code\n3. Apply fix\n4. Test again`;
        return {
            content: [
                {
                    type: 'text',
                    text: steps,
                },
            ],
        };
    }
    async handleGenerateCorrectedCode(args) {
        const { errorMessage, codeSnippet, language, framework } = args;
        // Placeholder: Replace with AI model call or static analysis
        const correctedCode = `// Corrected ${language} code${framework ? ' using ' + framework : ''}\n${codeSnippet}`;
        return {
            content: [
                {
                    type: 'text',
                    text: correctedCode,
                },
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
//# sourceMappingURL=index.js.map