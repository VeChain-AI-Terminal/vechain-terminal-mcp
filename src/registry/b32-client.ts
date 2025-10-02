/**
 * B32 Client - VeChain ABI Signature Service
 * Allows querying ABIs by their 4-byte signature
 * 
 * See: https://github.com/vechain/b32
 * API: https://b32.vecha.in
 */

const B32_API_URL = 'https://b32.vecha.in/q';

export interface ABIFragment {
  constant?: boolean;
  inputs?: Array<{
    name: string;
    type: string;
    internalType?: string;
    indexed?: boolean;
  }>;
  name?: string;
  outputs?: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  payable?: boolean;
  stateMutability?: string;
  type: 'function' | 'event' | 'constructor' | 'fallback' | 'receive';
  anonymous?: boolean;
}

/**
 * Query ABI by signature from b32.vecha.in
 * @param signature - 4-byte function signature (e.g., "0x06fdde03")
 * @returns Array of ABI fragments matching the signature
 */
export async function queryABIBySignature(signature: string): Promise<ABIFragment[]> {
  if (!signature.startsWith('0x') || signature.length !== 10) {
    throw new Error('Invalid signature format. Expected 0x followed by 8 hex characters');
  }

  try {
    const response = await fetch(`${B32_API_URL}/${signature}.json`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return []; // Signature not found
      }
      throw new Error(`B32 API error: ${response.status}`);
    }

    const data = await response.json();
    return data as ABIFragment[];
  } catch (error) {
    console.error(`Failed to query B32 for signature ${signature}:`, error);
    throw error;
  }
}

/**
 * Get function signature from method name
 * @param functionName - e.g., "name()"
 * @returns 4-byte signature
 */
export function getFunctionSignature(functionName: string): string {
  // This is a placeholder - in production, use proper keccak256 hashing
  // For now, we'll use known signatures
  const knownSignatures: Record<string, string> = {
    'name()': '0x06fdde03',
    'symbol()': '0x95d89b41',
    'decimals()': '0x313ce567',
    'totalSupply()': '0x18160ddd',
    'balanceOf(address)': '0x70a08231',
    'transfer(address,uint256)': '0xa9059cbb',
    'approve(address,uint256)': '0x095ea7b3',
    'allowance(address,address)': '0xdd62ed3e',
  };

  return knownSignatures[functionName] || '';
}

/**
 * Query multiple signatures at once
 */
export async function queryMultipleSignatures(signatures: string[]): Promise<Map<string, ABIFragment[]>> {
  const results = new Map<string, ABIFragment[]>();
  
  // Query in parallel
  const queries = signatures.map(async (sig) => {
    try {
      const abi = await queryABIBySignature(sig);
      results.set(sig, abi);
    } catch (error) {
      console.error(`Failed to query ${sig}:`, error);
      results.set(sig, []);
    }
  });

  await Promise.all(queries);
  return results;
}

/**
 * Get common ERC20/VIP-180 function ABIs
 */
export async function getERC20ABIs(): Promise<ABIFragment[]> {
  const signatures = [
    '0x06fdde03', // name()
    '0x95d89b41', // symbol()
    '0x313ce567', // decimals()
    '0x18160ddd', // totalSupply()
    '0x70a08231', // balanceOf(address)
    '0xa9059cbb', // transfer(address,uint256)
    '0x095ea7b3', // approve(address,uint256)
    '0xdd62ed3e', // allowance(address,address)
  ];

  const results = await queryMultipleSignatures(signatures);
  const abis: ABIFragment[] = [];

  for (const [_, fragments] of results) {
    if (fragments.length > 0) {
      abis.push(fragments[0]); // Take first match
    }
  }

  return abis;
}


