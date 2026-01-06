export class GroupCreatedEvent {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
    public readonly name: string,
    public readonly year: string,
    public readonly career: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
