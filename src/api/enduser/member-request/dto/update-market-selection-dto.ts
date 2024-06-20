import { ApiProperty } from '@nestjs/swagger';

export class UpdateMarketSelectionDto {
  @ApiProperty()
  marketId: string;
  @ApiProperty()
  deskIds: string[];
}