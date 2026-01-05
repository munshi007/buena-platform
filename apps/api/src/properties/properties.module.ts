import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { ExtractionService } from './extraction.service';
import { PropertiesController } from './properties.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, ExtractionService],
})
export class PropertiesModule { }
