import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ProviderWebhookDto } from './dto/provider-webhook.dto';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('provider')
  @HttpCode(200)
  async handleProvider(@Body() dto: ProviderWebhookDto) {
    await this.webhooksService.handleProviderWebhook(dto);
    return { ok: true };
  }
}
