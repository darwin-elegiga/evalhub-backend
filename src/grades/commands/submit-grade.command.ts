import { RoundingMethodDto } from '../dtos';

export class SubmitGradeCommand {
  constructor(
    public readonly assignmentId: string,
    public readonly teacherId: string,
    public readonly averageScore: number,
    public readonly finalGrade: number,
    public readonly roundingMethod: RoundingMethodDto,
  ) {}
}
