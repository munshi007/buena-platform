import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import type { TenantDto } from '@buena/shared';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    create(@Body() createTenantDto: TenantDto) {
        return this.tenantsService.create(createTenantDto);
    }

    @Get()
    findAll() {
        return this.tenantsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tenantsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTenantDto: Partial<TenantDto>) {
        return this.tenantsService.update(id, updateTenantDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tenantsService.remove(id);
    }
}
