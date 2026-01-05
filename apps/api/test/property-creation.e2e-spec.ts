import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { ManagementType, UnitType } from '@buena/shared';

describe('Property Creation Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('/properties (POST) - should create property with buildings and units transactionally', async () => {
    const payload = {
      generalInfo: {
        name: 'Grand Buena Hotel',
        managementType: ManagementType.WEG,
        managerId: 'mgr_1',
        accountantId: 'acc_1',
      },
      buildings: [
        { tempId: 'temp_b1', street: 'Main St', houseNumber: '1', city: 'Berlin', zipCode: '10115' },
        { tempId: 'temp_b2', street: 'Main St', houseNumber: '2', city: 'Berlin', zipCode: '10115' }
      ],
      units: [
        {
          buildingTempId: 'temp_b1',
          number: '1.01',
          type: UnitType.APARTMENT,
          floor: '1',
          size: 55.5,
          coOwnershipShare: 12.5,
          rooms: 2
        },
        {
          buildingTempId: 'temp_b2',
          number: '2.01',
          type: UnitType.OFFICE,
          size: 100,
          coOwnershipShare: 25,
          rooms: 4
        }
      ]
    };

    const response = await request(app.getHttpServer())
      .post('/properties')
      .send(payload)
      .expect(201);

    const property = response.body;
    expect(property.id).toBeDefined();
    expect(property.name).toBe('Grand Buena Hotel');
    expect(property.propertyNumber).toBe('BT-000001'); // First one in clean DB

    // Verify DB state
    const dbProperty = await prisma.property.findUnique({
      where: { id: property.id },
      include: { buildings: true, units: true }
    });

    expect(dbProperty).toBeDefined();
    expect(dbProperty?.buildings).toHaveLength(2);
    expect(dbProperty?.units).toHaveLength(2);

    const unit1 = dbProperty?.units.find(u => u.number === '1.01');
    expect(unit1).toBeDefined();
    // Verify mapped building ID
    const building1 = dbProperty?.buildings.find(b => b.houseNumber === '1');
    expect(unit1?.buildingId).toBe(building1?.id);
  });

  it('/properties (POST) - should rollback on invalid unit mapping', async () => {
    const payload = {
      generalInfo: {
        name: 'Faulty Towers',
        managementType: ManagementType.MV
      },
      buildings: [
        { tempId: 'temp_valid', street: 'Broken St', houseNumber: '99' }
      ],
      units: [
        {
          buildingTempId: 'temp_invalid_ref', // Points to nothing
          number: 'X',
          type: UnitType.APARTMENT,
          size: 50,
          coOwnershipShare: 10
        }
      ]
    };

    await request(app.getHttpServer())
      .post('/properties')
      .send(payload)
      .expect(400); // Bad Request from Service validation check

    // Verify Nothing Pesisted
    const property = await prisma.property.findFirst({ where: { name: 'Faulty Towers' } });
    expect(property).toBeNull();
  });
});
