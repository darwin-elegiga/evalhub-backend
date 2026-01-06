export class SubjectUpdatedEvent {
  constructor(
    public readonly subjectId: string,
    public readonly teacherId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
