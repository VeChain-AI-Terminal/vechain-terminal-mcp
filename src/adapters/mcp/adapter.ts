import { zodToJsonSchema } from 'zod-to-json-schema';
import type { WalletClientBase } from '../../core/WalletClientBase.js';
import type { PluginBase } from '../../core/PluginBase.js';
import type { ToolBase } from '../../core/ToolBase.js';
import { getTools } from '../../utils/getTools.js';

export interface GetOnChainToolsParams<TWalletClient extends WalletClientBase> {
  wallet: TWalletClient;
  plugins: PluginBase<TWalletClient>[];
}

/**
 * Convert VeChain tools to MCP format
 * Based on GOAT SDK's MCP adapter pattern
 */
export async function getOnChainTools<TWalletClient extends WalletClientBase>({
  wallet,
  plugins,
}: GetOnChainToolsParams<TWalletClient>) {
  const tools: ToolBase[] = await getTools({
    wallet,
    plugins,
  });

  return {
    /**
     * List all available tools in MCP format
     */
    listOfTools: () => {
      return tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          inputSchema: zodToJsonSchema(tool.parameters as any),
        };
      });
    },

    /**
     * Execute a tool by name with parameters
     */
    toolHandler: async (name: string, parameters: unknown) => {
      const tool = tools.find((tool) => tool.name === name);
      if (!tool) {
        throw new Error(`Tool ${name} not found`);
      }

      // Parse and validate parameters using the tool's Zod schema
      const parsedParameters = tool.parameters.parse(parameters ?? {});
      
      // Execute the tool
      const result = await tool.execute(parsedParameters);

      // Return in MCP format
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  };
}


