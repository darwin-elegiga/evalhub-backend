export class GetQuestionsQuery {
  constructor(
    public readonly teacherId: string,
    public readonly subjectId?: string,
    public readonly topicId?: string,
    public readonly type?: string,
    public readonly difficulty?: string,
  ) {}
}
