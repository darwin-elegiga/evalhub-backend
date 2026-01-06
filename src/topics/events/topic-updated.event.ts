export class TopicUpdatedEvent {
  constructor(
    public readonly topicId: string,
    public readonly teacherId: string,
    public readonly subjectId: string,
    public readonly name: string,
  ) {}
}
