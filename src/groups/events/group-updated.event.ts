export class GroupUpdatedEvent {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
