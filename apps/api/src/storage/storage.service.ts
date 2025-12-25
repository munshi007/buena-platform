import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface FileMetadata {
    originalName: string;
    mimeType: string;
    sizeBytes: number;
}

export interface StoredFile extends FileMetadata {
    storageKey: string;
    sha256?: string;
}

@Injectable()
export class StorageService {
    private readonly uploadDir = './uploads';

    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir);
        }
    }

    async store(file: Express.Multer.File): Promise<StoredFile> {
        // Sanitize filename: use UUID + ext
        const ext = path.extname(file.originalname);
        const storageKey = `${crypto.randomUUID()}${ext}`;
        const filePath = path.join(this.uploadDir, storageKey);

        // Calculate SHA256 (optional hygiene)
        const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');

        // Write to disk
        await fs.promises.writeFile(filePath, file.buffer);

        return {
            storageKey,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            sha256,
        };
    }
}
