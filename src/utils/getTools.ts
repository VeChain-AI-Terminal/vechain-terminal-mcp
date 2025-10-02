import type { WalletClientBase } from '../core/WalletClientBase.js';
import type { PluginBase } from '../core/PluginBase.js';
import type { ToolBase } from '../core/ToolBase.js';

export interface GetToolsParams<TWalletClient extends WalletClientBase> {
  wallet: TWalletClient;
  plugins: PluginBase<TWalletClient>[];
}

/**
 * Get all tools from wallet and plugins
 * Similar to GOAT SDK's getTools function
 */
export async function getTools<TWalletClient extends WalletClientBase>({
  wallet,
  plugins,
}: GetToolsParams<TWalletClient>): Promise<ToolBase[]> {
  const chain = wallet.getChain();
  
  // Get core wallet tools
  const walletTools = wallet.getCoreTools();
  
  // Get tools from plugins that support this chain
  const pluginTools: ToolBase[] = [];
  
  for (const plugin of plugins) {
    if (!plugin.supportsChain(chain)) {
      console.warn(`Plugin ${plugin.name} does not support chain ${chain.name}`);
      continue;
    }
    
    const tools = await plugin.getTools(wallet);
    pluginTools.push(...tools);
  }
  
  return [...walletTools, ...pluginTools];
}


