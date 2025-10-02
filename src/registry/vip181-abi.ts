/**
 * VIP-181 NFT Standard ABI
 * From B32 repository - vip181-mintable_v7.json
 * VIP-181 is VeChain's NFT standard (similar to ERC-721)
 */

type FunctionFragment = {
  name: string;
  inputs: Array<{ name: string; type: string }>;
  outputs: Array<{ name: string; type: string }>;
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
  type: 'function';
};

/**
 * Core VIP-181 functions for NFT operations
 */
export const VIP181_ABI: FunctionFragment[] = [
  // ==================== VIEW FUNCTIONS ====================
  {
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'ownerOf',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'tokenOfOwnerByIndex',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'tokenByIndex',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'getApproved',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'isApprovedForAll',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },

  // ==================== TRANSFER FUNCTIONS ====================
  {
    name: 'transferFrom',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    name: 'safeTransferFrom',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    name: 'approve',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    name: 'setApprovalForAll',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },

  // ==================== MINTING FUNCTIONS ====================
  {
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    name: 'safeMint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    name: 'mintWithURI',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'uri', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    name: 'burn',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

/**
 * Helper to get specific VIP-181 functions by name
 */
export const VIP181_FUNCTIONS = {
  // Query functions
  balanceOf: VIP181_ABI.find(f => f.name === 'balanceOf')!,
  ownerOf: VIP181_ABI.find(f => f.name === 'ownerOf')!,
  tokenURI: VIP181_ABI.find(f => f.name === 'tokenURI')!,
  name: VIP181_ABI.find(f => f.name === 'name')!,
  symbol: VIP181_ABI.find(f => f.name === 'symbol')!,
  totalSupply: VIP181_ABI.find(f => f.name === 'totalSupply')!,
  
  // Transfer functions
  transferFrom: VIP181_ABI.find(f => f.name === 'transferFrom')!,
  safeTransferFrom: VIP181_ABI.find(f => f.name === 'safeTransferFrom')!,
  approve: VIP181_ABI.find(f => f.name === 'approve')!,
  setApprovalForAll: VIP181_ABI.find(f => f.name === 'setApprovalForAll')!,
  
  // Minting functions
  mint: VIP181_ABI.find(f => f.name === 'mint')!,
  safeMint: VIP181_ABI.find(f => f.name === 'safeMint')!,
  mintWithURI: VIP181_ABI.find(f => f.name === 'mintWithURI')!,
  burn: VIP181_ABI.find(f => f.name === 'burn')!,
};


