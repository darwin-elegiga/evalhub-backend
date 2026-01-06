export class DeleteStudentCommand {
  constructor(
    public readonly studentId: string,
    public readonly teacherId: string,
  ) {}
}
