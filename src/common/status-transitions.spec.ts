import { resolveTransition } from './status-transitions';

describe('resolveTransition', () => {
  it('pending -> succeeded: обновить', () => {
    expect(resolveTransition('pending', 'succeeded')).toBe('update');
  });

  it('pending -> failed: обновить', () => {
    expect(resolveTransition('pending', 'failed')).toBe('update');
  });

  it('succeeded -> failed: игнорировать', () => {
    expect(resolveTransition('succeeded', 'failed')).toBe('ignore');
  });

  it('failed -> succeeded: игнорировать', () => {
    expect(resolveTransition('failed', 'succeeded')).toBe('ignore');
  });

  it.each(['pending', 'succeeded', 'failed'] as const)(
    '%s -> тот же статус: ничего не делать',
    (status) => {
      expect(resolveTransition(status, status)).toBe('noop');
    },
  );
});
