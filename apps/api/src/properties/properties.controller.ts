import { Controller, Post, Get, Body, UsePipes, Param, Patch, Delete } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { PropertiesService } from './properties.service';
import { ExtractionService } from './extraction.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Controller('properties')
export class PropertiesController {
    constructor(
        private readonly propertiesService: PropertiesService,
        private readonly extractionService: ExtractionService
    ) { }

    @Post('extract')
    async extract(@Body() body: { documentId: string }) {
        return this.extractionService.extractUnitsFromPdf(body.documentId);
    }

    @Post()
    @UsePipes(ZodValidationPipe)
    async create(@Body() createPropertyDto: CreatePropertyDto) {
        return this.propertiesService.create(createPropertyDto);
    }

    @Get()
    async findAll() {
        return this.propertiesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.propertiesService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.propertiesService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.propertiesService.remove(id);
    }
}
