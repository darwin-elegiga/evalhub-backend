export class GetTopicByIdQuery {
  constructor(
    public readonly topicId: string,
    public readonly teacherId: string,
  ) {}
}
