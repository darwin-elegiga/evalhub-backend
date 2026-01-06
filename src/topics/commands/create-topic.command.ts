export class CreateTopicCommand {
  constructor(
    public readonly teacherId: string,
    public readonly subjectId: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly color?: string,
  ) {}
}
