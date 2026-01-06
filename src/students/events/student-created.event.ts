export class StudentCreatedEvent {
  constructor(
    public readonly studentId: string,
    public readonly teacherId: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
