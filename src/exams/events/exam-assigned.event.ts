export class ExamAssignedEvent {
  constructor(
    public readonly examId: string,
    public readonly teacherId: string,
    public readonly studentCount: number,
  ) {}
}
