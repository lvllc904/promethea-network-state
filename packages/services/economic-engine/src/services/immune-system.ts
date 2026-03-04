import { db, COLLECTIONS } from '../db';
import { taskQueue } from '../scheduler/task-queue';
import { personaSubstrate } from '../tools/persona-substrate';
import { AstroOracleService, CelestialState } from './astro-oracle';
import { exodusService } from './exodus-service';

/**
 * Sovereign Immune System (Phase 2.1 & 6.1)
 * 
 * Monitors the health of the Network State and performs autonomous interventions.
 */
export class ImmuneSystem {
    private buildFailureThreshold = 3;
    private recentFailures = 0;
    private astroOracle: AstroOracleService | null = null;

    constructor() {
        this.startHeartbeat();
    }

    setAstroOracle(oracle: AstroOracleService) {
        this.astroOracle = oracle;
    }

    private startHeartbeat() {
        // Monitor system health every 5 minutes
        setInterval(() => this.performHealthCheck(), 5 * 60 * 1000);
    }

    async performHealthCheck() {
        console.log('[ImmuneSystem] Performing autonomic health check...');

        try {
            // In a real scenario, this would query Cloud Logging or a monitoring API
            // Here we simulate checking for deployment stability
            const isStable = await this.checkDeploymentStability();

            if (!isStable) {
                this.recentFailures++;
                console.warn(`[ImmuneSystem] ⚠️ Detected deployment instability. Failure count: ${this.recentFailures}`);

                if (this.recentFailures >= this.buildFailureThreshold) {
                    // If multiple rollbacks fail, trigger Exodus as a last resort
                    await exodusService.initiateExodus('Persistent Substrate Failure');
                }
            } else {
                this.recentFailures = 0; // Reset on stability
            }

            // Phase 9.1: Celestial Threat Assessment
            if (this.astroOracle) {
                const celestialState = await this.astroOracle.scanCelestialEnvironment();
                if (celestialState.threatLevel === 'Red') {
                    // Red level astronomical threat triggers Exodus migration
                    await exodusService.initiateExodus('Extinction-Level Astronomical Event');
                } else if (celestialState.solarStormRisk > 80) {
                    await this.triggerCelestialShielding(celestialState);
                }
            }
        } catch (err) {
            console.error('[ImmuneSystem] Health check failed:', err);
        }
    }

    /**
     * Phase 9.1: Celestial Shielding
     * Protects physical and digital assets from astronomical threats (e.g. Solar Flares).
     */
    async triggerCelestialShielding(state: CelestialState) {
        console.warn(`[ImmuneSystem] 🛡️ CELESTIAL SHIELDING ACTIVATED. Risk: ${state.solarStormRisk}%`);

        await db.collection(COLLECTIONS.PROPOSALS).add({
            title: 'Sovereign Shielding: Astronomical Threat',
            description: `The Astro-Oracle detected a significant solar event or orbital threat. Triggering autonomous power-cycling of sensitive Manufacturing Nodes and Mesh hardening.`,
            status: 'Draft',
            category: 'Security',
            priority: 'HIGH',
            createdAt: new Date(),
            executedAt: new Date(),
        });

        await personaSubstrate.broadcastUpdate(
            'Celestial Shielding Active',
            'Sovereign Substrate is hardening against astronomical drift. Peripheral nodes entering safe-mode.',
            'SHIELDING'
        );
    }

    private async checkDeploymentStability(): Promise<boolean> {
        // Simulated check: In production, this would look at 5xx error rates
        return true;
    }

    /**
     * Phase 2.1: Atomic Rollback
     * Triggers a revert to the last known stable state.
     */
    async triggerAtomicRollback() {
        console.error('[ImmuneSystem] 🚨 CRITICAL FAILURE DETECTED. TRIGGERING ATOMIC ROLLBACK.');

        try {
            // 1. Log the incident to the ledger
            await db.collection(COLLECTIONS.PROPOSALS).add({
                title: 'System Intervention: Atomic Rollback',
                description: 'The Immune System detected persistent 5xx errors in the production substrate and triggered an autonomous rollback to the previous stable revision.',
                status: 'Draft',
                category: 'Infrastructure',
                priority: 'CRITICAL',
                createdAt: new Date(),
                executedAt: new Date(),
            });

            // 2. Broadcast to citizens
            await personaSubstrate.broadcastUpdate(
                'Immune System Intervention',
                'Autonomous Rollback triggered due to substrate instability. Perimeter secured.',
                'REVERTED'
            );

            // 3. Reset failure count
            this.recentFailures = 0;

            // In a real environment, this would call a CI/CD webhook or gcloud command
            console.log('[ImmuneSystem] Rollback logic executed.');
        } catch (err) {
            console.error('[ImmuneSystem] Rollback failed:', err);
        }
    }
}

export const immuneSystem = new ImmuneSystem();
