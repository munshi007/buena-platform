import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';
import { PropertiesModule } from './properties/properties.module';
import { StorageModule } from './storage/storage.module';
import { PrismaModule } from './prisma/prisma.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PropertiesModule,
    ReportsModule,
    StorageModule,
    PrismaModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
