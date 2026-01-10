import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AssignmentResponseDto } from './assignment-response.dto';

export class StartAssignmentDto {
  @ApiProperty({
    description: 'ID de la asignación a iniciar',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  assignmentId: string;
}

export class StartAssignmentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: AssignmentResponseDto })
  assignment: AssignmentResponseDto;
}
