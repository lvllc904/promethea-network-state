// L2 RPC Configuration Definitions
import process from "process";

/**
 * @fileoverview Defines the necessary environment variables and configuration for connecting
 * the Promethea systems (Microservices, Sentinel) to the Base Layer 2 (L2) network.
 * This is used for the "Penny Test" to verify the first financial transaction.
 */

// NOTE: These variables are read directly by the Sentinel/MCP server via ENV variables
// for security, but the structure is defined here for TypeScript clarity.

export const BASE_L2_RPC_URL_KEY = "BASE_L2_RPC_URL";
export const BASE_TEST_WALLET_PK_KEY = "BASE_TEST_WALLET_PRIVATE_KEY";

export interface L2Config {
    /** The HTTP/S endpoint for the Base L2 network RPC. */
    rpcUrl: string;
    /** The private key for the designated test wallet (for sending the 'Penny Test' transaction). */
    privateKey: string;
}

/**
 * Retrieves the L2 configuration from environment variables.
 * @returns {L2Config} The validated L2 connection details.
 * @throws {Error} If required environment variables are missing.
 */
export function getL2Config(): L2Config {
    const rpcUrl = process.env[BASE_L2_RPC_URL_KEY];
    const privateKey = process.env[BASE_TEST_WALLET_PK_KEY];

    if (!rpcUrl || !privateKey) {
        throw new Error(
            `CRITICAL: Missing L2 configuration environment variables. 
             Required: ${BASE_L2_RPC_URL_KEY} and ${BASE_TEST_WALLET_PK_KEY}`
        );
    }

    return {
        rpcUrl,
        privateKey,
    };
}
