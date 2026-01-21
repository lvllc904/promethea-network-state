import 'dotenv/config';
import { UnifiedIntelligence } from './unified-intelligence';
// This file now exports the UnifiedIntelligence class, making it a library.
// The Express server logic has been removed as it was incorrect for this package.
/**
 * The main export of the Guardian package.
 * This allows other services to create an instance of the system's core intelligence.
 */
export { UnifiedIntelligence };
// You can also export a singleton instance if desired, which is a common pattern.
const guardianSingleton = UnifiedIntelligence.getInstance();
export { guardianSingleton };
