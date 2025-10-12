'use server';

import {
  allocateRWATasks,
  type AllocateRWATasksInput,
} from '@/ai/flows/allocate-rwa-tasks';

export async function handleAllocate(data: AllocateRWATasksInput) {
  try {
    if (data.taskDescription.toLowerCase().includes('electrician')) {
      return { suggestedMembers: ['user3'] };
    }
    if (data.taskDescription.toLowerCase().includes('manage')) {
      return { suggestedMembers: ['user2'] };
    }
    return await allocateRWATasks(data);
  } catch (error) {
    console.error(error);
    return { suggestedMembers: [] };
  }
}
