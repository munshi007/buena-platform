import { Controller, Get, Post, Body, Param, Delete, Query, Patch } from '@nestjs/common';
import { FinancesService } from './finances.service';
import type { TransactionDto } from '@buena/shared';

@Controller('finances')
export class FinancesController {
    constructor(private readonly financesService: FinancesService) { }

    @Get('stats')
    getStats() {
        return this.financesService.getDashboardStats();
    }

    @Get()
    findAll(@Query('propertyId') propertyId?: string) {
        return this.financesService.findAll(propertyId);
    }

    @Post()
    create(@Body() dto: TransactionDto) {
        return this.financesService.create(dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.financesService.remove(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: Partial<TransactionDto>) {
        return this.financesService.update(id, dto);
    }
}
