// Engine core: append-only domain events are the smallest shared protocol between adapters.
export type DomainEventType = "job.queued" | "job.preparing" | "runner.selected" | "job.running" | "job.syncing" | "storage.committed" | "job.completed" | "job.failed";
export type DomainEvent = { id: string; type: DomainEventType; jobId: string; at: number; data: Record<string, unknown> };
export interface EventSink { emit(event: DomainEvent): void | Promise<void>; }
export class InMemoryEventSink implements EventSink {
  private readonly recorded: DomainEvent[] = [];
  emit(event: DomainEvent): void { this.recorded.push(event); }
  all(): readonly DomainEvent[] { return this.recorded; }
}
