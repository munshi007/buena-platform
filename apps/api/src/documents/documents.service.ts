import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService) { }

    async create(propertyId: string, data: { name: string, kind: any, file: any }) {
        return this.prisma.document.create({
            data: {
                propertyId,
                name: data.name,
                kind: data.kind,
                versions: {
                    create: {
                        version: 1,
                        originalName: data.file.originalName,
                        mimeType: 'application/pdf', // simplified
                        sizeBytes: data.file.size,
                        storageKey: data.file.filename,
                    }
                }
            },
            include: {
                versions: true
            }
        });
    }

    async addVersion(documentId: string, file: any) {
        const latestVersion = await this.prisma.documentVersion.findFirst({
            where: { documentId },
            orderBy: { version: 'desc' }
        });

        return this.prisma.documentVersion.create({
            data: {
                documentId,
                version: (latestVersion?.version || 0) + 1,
                originalName: file.originalName,
                mimeType: 'application/pdf',
                sizeBytes: file.size,
                storageKey: file.filename,
            }
        });
    }

    async remove(id: string) {
        return this.prisma.document.delete({
            where: { id }
        });
    }
}
