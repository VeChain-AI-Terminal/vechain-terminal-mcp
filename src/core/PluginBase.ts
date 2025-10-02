import { type StoredToolMetadataMap, toolMetadataKey } from './Tool.decorator.js';
import type { Chain } from './types.js';
import { type ToolBase, createTool } from './ToolBase.js';
import type { WalletClientBase } from './WalletClientBase.js';

/**
 * Abstract base class for plugins that provide tools for wallet interactions
 * Based on GOAT SDK's PluginBase pattern
 */
export abstract class PluginBase<TWalletClient extends WalletClientBase = WalletClientBase> {
  constructor(
    public readonly name: string,
    public readonly toolProviders: Object[] // Service classes with @Tool decorated methods
  ) {}

  /**
   * Checks if the plugin supports a specific blockchain
   */
  abstract supportsChain(chain: Chain): boolean;

  /**
   * Retrieves the tools provided by the plugin
   * Automatically extracts tools from @Tool decorated methods
   */
  getTools(walletClient: TWalletClient): ToolBase[] | Promise<ToolBase[]> {
    const tools: ToolBase[] = [];

    for (const toolProvider of this.toolProviders) {
      const toolsMap = Reflect.getMetadata(toolMetadataKey, toolProvider.constructor) as
        | StoredToolMetadataMap
        | undefined;

      if (!toolsMap) {
        const constructorName = toolProvider.constructor.name;
        if (constructorName === 'Function') {
          console.warn(
            'Detected a non-instance tool provider. Please ensure you are passing instances, using `new MyToolProvider()`'
          );
        } else {
          console.warn(
            `No tools found for ${constructorName}. Please ensure you are using the '@Tool' decorator.`
          );
        }
        continue;
      }

      for (const tool of toolsMap.values()) {
        tools.push(
          createTool(
            {
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters.schema,
            },
            (params) => {
              const args: any[] = [];
              if (tool.walletClient) {
                args[tool.walletClient.index] = walletClient;
              }
              
              // Instantiate the parameter class with the parsed parameters
              try {
                const parameterInstance = new (tool.parameters as any).constructor(params);
                args[tool.parameters.index] = parameterInstance;
              } catch (error) {
                console.error('PluginBase: Parameter instantiation failed:', error);
                throw error;
              }

              return tool.target.apply(toolProvider, args);
            }
          )
        );
      }
    }

    return tools;
  }
}


