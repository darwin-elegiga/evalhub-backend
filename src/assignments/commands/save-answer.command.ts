export class SaveAnswerCommand {
  constructor(
    public readonly assignmentId: string,
    public readonly questionId: string,
    public readonly selectedOptionId?: string | null,
    public readonly answerText?: string | null,
    public readonly answerLatex?: string | null,
    public readonly answerNumeric?: number | null,
    public readonly answerPoint?: Record<string, unknown> | null,
  ) {}
}
