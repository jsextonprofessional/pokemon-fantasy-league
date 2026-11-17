import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

const ciLintProbe = 'intentional validation failure';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ description: 'Service is up', schema: { example: { status: 'ok' } } })
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
