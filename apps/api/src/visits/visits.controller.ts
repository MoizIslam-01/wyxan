import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HistoryQueryDto } from './dto/history-query.dto.js';
import { RecordVisitDto } from './dto/record-visit.dto.js';
import { VisitsService } from './visits.service.js';

@Controller()
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post('visits')
  record(@Body() dto: RecordVisitDto) {
    return this.visitsService.record(dto);
  }

  @Get('people/:personId/history')
  history(
    @Param('personId') personId: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.visitsService.history(personId, query);
  }
}
