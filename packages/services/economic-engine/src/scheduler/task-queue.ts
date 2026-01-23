import { BaseMethod, ExecutionResult } from '../methods/base-method';

/**
 * Task Queue Scheduler (Phase 3)
 * 
 * Priority-based queue for autonomous execution of economic methods.
 * Ensures fair distribution of resources across all 50 methods.
 */

interface QueuedTask {
    method: BaseMethod;
    priority: number;
    scheduledTime: number;
}

export class TaskQueue {
    private queue: QueuedTask[] = [];
    private running: boolean = false;
    private methods: Map<string, BaseMethod> = new Map();

    /**
     * Register a method for autonomous execution
     */
    registerMethod(method: BaseMethod): void {
        this.methods.set(method.methodId, method);
    }

    /**
     * Schedule a method for execution
     */
    schedule(methodId: string, priority?: number): void {
        const method = this.methods.get(methodId);
        if (!method) {
            console.error(`[TaskQueue] Method not found: ${methodId}`);
            return;
        }

        this.queue.push({
            method,
            priority: priority ?? method.getStats().config.priority,
            scheduledTime: Date.now(),
        });

        // Sort by priority (higher first)
        this.queue.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Start autonomous execution loop
     */
    async start(): Promise<void> {
        if (this.running) return;
        this.running = true;

        console.log('[TaskQueue] Starting autonomous execution loop');

        while (this.running) {
            if (this.queue.length === 0) {
                // Wait 1 minute before checking again
                await this.sleep(60000);
                continue;
            }

            const task = this.queue.shift();
            if (!task) continue;

            console.log(`[TaskQueue] Executing: ${task.method.methodName}`);
            const result = await task.method.run();

            if (result.success) {
                console.log(`[TaskQueue] ✅ ${task.method.methodName}: $${result.profit} profit`);
            } else {
                console.log(`[TaskQueue] ❌ ${task.method.methodName}: ${result.error}`);
            }

            // Wait 5 seconds between executions to avoid rate limits
            await this.sleep(5000);
        }
    }

    /**
     * Stop execution loop
     */
    stop(): void {
        this.running = false;
        console.log('[TaskQueue] Stopped');
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            running: this.running,
            queueLength: this.queue.length,
            registeredMethods: this.methods.size,
            nextTask: this.queue[0]?.method.methodName ?? null,
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const taskQueue = new TaskQueue();
