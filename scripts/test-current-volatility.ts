// scripts/test-current-volatility.ts
// Script to test the current volatility API endpoint
// Run with: npx ts-node scripts/test-current-volatility.ts

import { fetchAndLogCurrentVolatility } from '../features/currentVolatility/api';

async function main() {
  console.log('Fetching current volatility data...\n');
  
  try {
    await fetchAndLogCurrentVolatility();
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

