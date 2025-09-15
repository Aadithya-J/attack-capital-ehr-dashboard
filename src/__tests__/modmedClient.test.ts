import { describe, expect, it, beforeEach, jest } from '@jest/globals';

describe('modmedClient', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.MODMED_BASE_URL = 'https://example.com';
    process.env.MODMED_FIRM_URL_PREFIX = 'firm123';
  });

  it('should configure axios client with correct baseURL and headers', async () => {
    const clientModule = await import('@/lib/modmedClient');
    const client = clientModule.default;

    expect(client.defaults.baseURL).toBe('https://example.com/firm123');
    expect(client.defaults.headers).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    );
  });
});
