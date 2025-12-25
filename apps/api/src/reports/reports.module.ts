import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PropertiesModule } from '../properties/properties.module'; // To access ExtractionService if needed

@Module({
    imports: [PrismaModule, PropertiesModule],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
