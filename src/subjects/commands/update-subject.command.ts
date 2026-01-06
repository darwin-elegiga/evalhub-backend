export class UpdateSubjectCommand {
  constructor(
    public readonly subjectId: string,
    public readonly teacherId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly color?: string,
  ) {}
}
