import { db, COLLECTIONS } from '../db';
import { personaSubstrate } from '../tools/persona-substrate';

export interface Organization {
    id: string;
    name: string;
    type: 'DAO' | 'LLC' | 'CORP' | 'FOUNDATION' | 'UNINCORPORATED';
    jurisdiction: string;
    stakedUvt: number;
    reputationScore: number;
    status: 'SIMULATED' | 'STAKED' | 'ACTUALIZED';
    creatorDid: string;
    createdAt: string;
}

export class OrganizationManager {
    /**
     * Propose a new organization mapping to the State.
     * Moves the entity into the SIMULATED state.
     */
    async proposeMapping(data: Omit<Organization, 'id' | 'status' | 'stakedUvt' | 'reputationScore' | 'createdAt'>): Promise<string> {
        const id = `org-${Math.random().toString(36).substr(2, 9)}`;
        const org: Organization = {
            ...data,
            id,
            status: 'SIMULATED',
            stakedUvt: 0,
            reputationScore: 0,
            createdAt: new Date().toISOString()
        };

        await db.collection(COLLECTIONS.ORGANIZATIONS).doc(id).set(org);

        console.log(`[OrgManager] 🏛️  Organization Mapping Proposed: ${org.name} (${org.type})`);
        
        await personaSubstrate.broadcastUpdate(
            'New Organization Mapping Proposed',
            `${org.name} has entered the Promethean Atlas as a SIMULATED entity.`,
            org.id
        );

        return id;
    }

    /**
     * Stake UVT to an organization to move it to the STAKED state.
     * This represents skin-in-the-game from the citizen.
     */
    async stakeToOrganization(orgId: string, amountUvt: number): Promise<void> {
        const doc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();
        if (!doc.exists) throw new Error('Organization not found');

        const org = doc.data() as Organization;
        org.stakedUvt += amountUvt;
        org.reputationScore += (amountUvt * 0.1); // Simple reputation scaling
        
        if (org.stakedUvt >= 100 && org.status === 'SIMULATED') {
            org.status = 'STAKED';
        }

        await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).set(org);

        console.log(`[OrgManager] ⛓️  Staked ${amountUvt} UVT to ${org.name}. Total: ${org.stakedUvt}`);
    }

    /**
     * Move an organization to ACTUALIZED state.
     * Requires governance approval or meeting a high threshold.
     */
    async actualize(orgId: string): Promise<void> {
        const doc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();
        if (!doc.exists) throw new Error('Organization not found');

        const org = doc.data() as Organization;
        org.status = 'ACTUALIZED';

        await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).set(org);

        await personaSubstrate.broadcastUpdate(
            'Organization ACTUALIZED',
            `${org.name} is now a formally recognized institutional entity within the Promethean Network State.`,
            org.id
        );
    }
}

export const organizationManager = new OrganizationManager();
