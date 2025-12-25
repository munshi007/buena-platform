import { Controller, Get, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get aggregated portfolio statistics' })
    async getStats() {
        return this.reportsService.getStats();
    }

    @Post('ai-summary')
    @ApiOperation({ summary: 'Generate AI executive summary of the portfolio' })
    async generateAiSummary() {
        return this.reportsService.generateAiSummary();
    }
}
