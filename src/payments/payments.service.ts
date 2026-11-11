import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
  ) {}

  async create(
    idempotencyKey: string,
    dto: CreatePaymentDto,
  ): Promise<{ payment: Payment; created: boolean }> {
    const existing = await this.payments.findOneBy({ idempotencyKey });
    if (existing) {
      return { payment: existing, created: false };
    }

    try {
      const payment = await this.payments.save(
        this.payments.create({
          amount: dto.amount,
          currency: dto.currency,
          idempotencyKey,
          // провайдер ненастоящий
          providerPaymentId: `prov_${randomUUID()}`,
        }),
      );
      return { payment, created: true };
    } catch (error) {
      // параллельный запрос с тем же ключом успел раньше
      if (isUniqueViolation(error)) {
        const payment = await this.payments.findOneByOrFail({ idempotencyKey });
        return { payment, created: false };
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.payments.findOneBy({ id });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
  );
}
