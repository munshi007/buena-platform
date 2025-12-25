import { createZodDto } from 'nestjs-zod';
import { createPropertySchema } from '@buena/shared';

export class CreatePropertyDto extends createZodDto(createPropertySchema) { }
