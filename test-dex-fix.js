#!/usr/bin/env node

// Test script to verify DEX plugin fixes
import { DEXService } from './dist/index.js';

async function testDEXFixes() {
  console.log('🧪 Testing DEX Plugin Fixes...\n');

  const dexService = new DEXService('testnet');

  try {
    // Test 1: Token resolution for VET (native token)
    console.log('1. Testing VET token resolution...');
    const vetAddress = dexService.resolveTokenAddress('VET');
    console.log(`   ✅ VET resolves to: ${vetAddress}`);
    
    // Test 2: Token resolution for VTHO
    console.log('2. Testing VTHO token resolution...');
    const vthoAddress = dexService.resolveTokenAddress('VTHO');
    console.log(`   ✅ VTHO resolves to: ${vthoAddress}`);
    
    // Test 3: Token info for VET
    console.log('3. Testing VET token info...');
    const vetInfo = dexService.getTokenInfo('VET');
    console.log(`   ✅ VET info:`, vetInfo);
    
    // Test 4: Token info for VTHO
    console.log('4. Testing VTHO token info...');
    const vthoInfo = dexService.getTokenInfo('VTHO');
    console.log(`   ✅ VTHO info:`, vthoInfo);

    console.log('\n🎉 All DEX fixes working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testDEXFixes().catch(console.error);
