import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post(':propertyId')
    create(@Param('propertyId') propertyId: string, @Body() data: any) {
        return this.documentsService.create(propertyId, data);
    }

    @Post(':documentId/versions')
    addVersion(@Param('documentId') documentId: string, @Body() file: any) {
        return this.documentsService.addVersion(documentId, file);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.documentsService.remove(id);
    }
}
