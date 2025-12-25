import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

function generateFilename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
}

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: generateFilename
        })
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // Return public URL (assuming static serve setup)
        return {
            filename: file.filename,
            path: `/uploads/${file.filename}`,
            originalName: file.originalname,
            size: file.size
        };
    }
}
