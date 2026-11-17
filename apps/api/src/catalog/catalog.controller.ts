import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogQuerySchema } from '@pfl/shared';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@Query() rawQuery: unknown) {
    const result = CatalogQuerySchema.safeParse(rawQuery);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues
          .map((issue) => `${issue.path.join('.') || 'query'}: ${issue.message}`)
          .join('; '),
      );
    }
    return this.catalog.list(result.data);
  }
}
