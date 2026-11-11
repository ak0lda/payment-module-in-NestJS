import { IsIn, IsInt, Max, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amount: number;

  @IsIn(['RUB', 'USD', 'EUR'])
  currency: string;
}
