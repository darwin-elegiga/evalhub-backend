export class CreateQuestionCommand {
  constructor(
    public readonly teacherId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly questionType: string,
    public readonly typeConfig: Record<string, unknown>,
    public readonly subjectId?: string,
    public readonly topicId?: string,
    public readonly difficulty?: string,
    public readonly estimatedTimeMinutes?: number,
    public readonly tags?: string[],
    public readonly weight?: number,
  ) {}
}
