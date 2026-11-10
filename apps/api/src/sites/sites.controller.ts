import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto.js';
import { SitesService } from './sites.service.js';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get('search')
  search(@Query('q') query = '') {
    return this.sitesService.search(query);
  }

  @Get(':address')
  findByAddress(@Param('address') address: string) {
    return this.sitesService.findByAddress(address);
  }

  @Post()
  publish(@Body() dto: CreateSiteDto) {
    return this.sitesService.publish(dto);
  }
}
