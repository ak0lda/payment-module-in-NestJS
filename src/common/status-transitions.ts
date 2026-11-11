export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

export type TransitionResult = 'update' | 'ignore' | 'noop';

export function resolveTransition(
  current: PaymentStatus,
  incoming: PaymentStatus,
): TransitionResult {
  if (current === incoming) {
    return 'noop';
  }
  if (current === 'pending') {
    return 'update';
  }
  return 'ignore';
}
