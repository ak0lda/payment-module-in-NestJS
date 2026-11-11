import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { resolveTransition } from '../common/status-transitions';
import { Payment } from '../payments/entities/payment.entity';
import { ProviderWebhookDto } from './dto/provider-webhook.dto';
import { WebhookEvent } from './entities/webhook-event.entity';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly dataSource: DataSource) {}

  async handleProviderWebhook(dto: ProviderWebhookDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const payment = await manager
        .getRepository(Payment)
        .createQueryBuilder('payment')
        .setLock('pessimistic_write')
        .where('payment.providerPaymentId = :id', {
          id: dto.provider_payment_id,
        })
        .getOne();

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // дубль события не должен ронять транзакцию, поэтому orIgnore, а не catch
      const inserted = await manager
        .createQueryBuilder()
        .insert()
        .into(WebhookEvent)
        .values({
          eventId: dto.event_id,
          paymentId: payment.id,
          status: dto.status,
        })
        .orIgnore()
        .returning('id')
        .execute();

      if (inserted.raw.length === 0) {
        this.logger.log(
          `Повторная доставка события ${dto.event_id}, пропускаем`,
        );
        return;
      }

      const result = resolveTransition(payment.status, dto.status);

      if (result === 'ignore') {
        this.logger.warn(
          `Недопустимый переход ${payment.status} -> ${dto.status} ` +
            `для платежа ${payment.id} (событие ${dto.event_id}), игнорируем`,
        );
        return;
      }

      if (result === 'update') {
        payment.status = dto.status;
        await manager.save(payment);
      }
    });
  }
}
