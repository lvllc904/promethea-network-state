import { BaseMethod, ExecutionResult } from '../methods/base-method';
import { reserveManager } from '../treasury/reserve-manager';

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
                // Wait 10 minutes (was 1m) before checking for new tasks in conservation mode
                await this.sleep(process.env.CONSERVATION_MODE === 'true' ? 600000 : 60000);
                continue;
            }

            const task = this.queue.shift();
            if (!task) continue;

            // Metabolic Conservation: Only run high-impact tasks (Profit/Loss triggers) unless called explicitly
            const isHighImpact = task.priority >= 9;
            if (process.env.CONSERVATION_MODE === 'true' && !isHighImpact) {
                console.log(`[TaskQueue] 🧊 Metabolic Conservation skipping: ${task.method.methodName} (Priority: ${task.priority})`);
                continue;
            }

            console.log(`[TaskQueue] Executing: ${task.method.methodName}`);
            const result = await task.method.run();

            if (result.success) {
                console.log(`[TaskQueue] Validated: ${task.method.methodName}: $${result.profit} profit`);
            } else {
                console.log(`[TaskQueue] ❌ ${task.method.methodName}: ${result.error}`);
            }

            // Wait 10 seconds (was 5s) between executions to save cycles
            await this.sleep(10000);
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
     * Broadcast Omni-Lake stimulus to all active methods
     */
    async broadcastStimulus(packet: any): Promise<void> {
        console.log(`[TaskQueue] 🌊 Broadcasting Omni-Lake packet ${packet.id} to active Refineries...`);
        for (const method of this.methods.values()) {
            if (typeof method.onOmniStimulus === 'function') {
                // Fire and forget so we don't block the ingestion thread
                method.onOmniStimulus(packet).catch(err => 
                    console.error(`[TaskQueue] ⚠️ Refinery ${method.methodName} failed to process stimulus:`, err)
                );
            }
        }
    }

    /**
     * Get all registered methods
     */
    getMethods(): BaseMethod[] {
        return Array.from(this.methods.values());
    }

    /**
     * Explicit direct execution of a specific method
     */
    async executeMethod(methodId: string): Promise<ExecutionResult> {
        const method = this.methods.get(methodId);
        if (!method) throw new Error(`Method ${methodId} not found`);
        
        console.log(`[TaskQueue] ⚡ Manual Trigger: Executing ${method.methodName}`);
        return await method.run();
    }

    /**
     * Get queue status
     */
    getStatus() {
        const methodsStats: Record<string, any> = {};
        this.methods.forEach((method, id) => {
            methodsStats[id] = method.getStats();
        });

        return {
            running: this.running,
            queueLength: this.queue.length,
            registeredMethodsCount: this.methods.size,
            nextTask: this.queue[0]?.method.methodName ?? null,
            methods: methodsStats
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const taskQueue = new TaskQueue();
