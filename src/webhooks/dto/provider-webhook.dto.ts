import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ProviderWebhookDto {
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @IsString()
  @IsNotEmpty()
  provider_payment_id: string;

  @IsIn(['succeeded', 'failed'])
  status: 'succeeded' | 'failed';
}
