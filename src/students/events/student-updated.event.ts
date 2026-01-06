export class StudentUpdatedEvent {
  constructor(
    public readonly studentId: string,
    public readonly teacherId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
