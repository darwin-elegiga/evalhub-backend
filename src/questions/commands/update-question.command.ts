export class UpdateQuestionCommand {
  constructor(
    public readonly questionId: string,
    public readonly teacherId: string,
    public readonly title?: string,
    public readonly content?: string,
    public readonly questionType?: string,
    public readonly typeConfig?: Record<string, unknown>,
    public readonly subjectId?: string | null,
    public readonly topicId?: string | null,
    public readonly difficulty?: string,
    public readonly estimatedTimeMinutes?: number | null,
    public readonly tags?: string[],
    public readonly weight?: number,
  ) {}
}
