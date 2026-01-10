import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AssignmentResponseDto } from './assignment-response.dto';

export class SubmitAssignmentDto {
  @ApiProperty({
    description: 'ID de la asignación a enviar',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  assignmentId: string;
}

export class SubmitAssignmentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: AssignmentResponseDto })
  assignment: AssignmentResponseDto;
}
