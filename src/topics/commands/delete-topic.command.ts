export class DeleteTopicCommand {
  constructor(
    public readonly topicId: string,
    public readonly teacherId: string,
  ) {}
}
