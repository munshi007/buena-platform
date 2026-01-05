import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';
import { PropertiesModule } from './properties/properties.module';
import { StorageModule } from './storage/storage.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { LeasesModule } from './leases/leases.module';
import { FinancesModule } from './finances/finances.module';
import { DocumentsModule } from './documents/documents.module';

import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PropertiesModule,
    ReportsModule,
    StorageModule,
    PrismaModule,
    TenantsModule,
    LeasesModule,
    FinancesModule,
    DocumentsModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
