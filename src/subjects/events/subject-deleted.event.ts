export class SubjectDeletedEvent {
  constructor(
    public readonly subjectId: string,
    public readonly teacherId: string,
    public readonly name: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
