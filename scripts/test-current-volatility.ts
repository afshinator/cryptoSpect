// scripts/test-current-volatility.ts
// Script to test the current volatility API endpoint
// Run with: npx ts-node scripts/test-current-volatility.ts

import { fetchAndLogCurrentVolatility } from '../features/currentVolatility/api';
import { ERR, log, LOG } from '../utils/log';

async function main() {
  log('Fetching current volatility data...\n', LOG);
  
  try {
    await fetchAndLogCurrentVolatility();
  } catch (error: any) {
    log(`Error: ${error.message}`, ERR);
    process.exit(1);
  }
}

main();

