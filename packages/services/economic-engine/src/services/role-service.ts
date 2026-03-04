import { PermissionFlagsBits, Role } from 'discord.js';

/**
 * Role Service
 * Allows users to purchase premium Discord roles for UVT
 */

export interface RoleProduct {
    id: string;
    name: string;
    cost: number; // UVT
    roleId?: string; // Discord role ID
    color?: number;
    permissions?: bigint[];
}

export const ROLE_PRODUCTS: RoleProduct[] = [
    {
        id: 'sovereign-contributor',
        name: '👑 Sovereign Contributor',
        cost: 50,
        color: 0xFFD700 // Gold
    },
    {
        id: 'ai-researcher',
        name: '🤖 AI Researcher',
        cost: 30,
        color: 0x00BFFF // Deep Sky Blue
    },
    {
        id: 'early-citizen',
        name: '🏛️ Early Citizen',
        cost: 100,
        color: 0x9B59B6 // Purple
    }
];

/**
 * Assign a role to a user in the guild
 */
export async function assignRole(guild: any, userId: string, roleProduct: RoleProduct): Promise<string> {
    console.log(`[RoleService] Assigning role ${roleProduct.name} to ${userId}`);

    // Find or create role
    let role = guild.roles.cache.find((r: Role) => r.name === roleProduct.name);

    if (!role) {
        // Create the role
        role = await guild.roles.create({
            name: roleProduct.name,
            color: roleProduct.color || 0x99AAB5,
            reason: 'Premium UVT Role Purchase'
        });
        console.log(`[RoleService] Created new role: ${roleProduct.name}`);
    }

    // Assign role to user
    const member = await guild.members.fetch(userId);
    await member.roles.add(role);

    console.log(`[RoleService] Role assigned successfully`);
    return role.id;
}

export function getRoleProduct(id: string): RoleProduct | undefined {
    return ROLE_PRODUCTS.find(p => p.id === id);
}
