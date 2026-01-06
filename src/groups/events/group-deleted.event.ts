export class GroupDeletedEvent {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
