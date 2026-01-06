export class UpdateStudentCommand {
  constructor(
    public readonly studentId: string,
    public readonly teacherId: string,
    public readonly fullName?: string,
    public readonly email?: string,
    public readonly year?: string,
    public readonly career?: string,
  ) {}
}
