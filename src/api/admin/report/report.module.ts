import { Module } from '@nestjs/common';
import { CoachController } from './coach/coach.controller';
import { CoachTestController } from './coach-test/coach-test.controller';

@Module({
  controllers: [CoachController, CoachTestController]
})
export class ReportModule {}
