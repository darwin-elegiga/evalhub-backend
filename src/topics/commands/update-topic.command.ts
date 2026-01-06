export class UpdateTopicCommand {
  constructor(
    public readonly topicId: string,
    public readonly teacherId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly color?: string,
    public readonly subjectId?: string,
  ) {}
}
