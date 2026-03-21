import { describe, it, expect, vi, afterEach } from 'vitest';

describe('env config', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
    vi.resetModules();
  });

  it('throws when DISCORD_TOKEN is missing', async () => {
    delete process.env.DISCORD_TOKEN;
    process.env.DISCORD_CLIENT_ID = 'client123';
    await expect(import('../../config/env')).rejects.toThrow();
  });

  it('parses valid env vars without throwing', async () => {
    process.env.DISCORD_TOKEN = 'token123';
    process.env.DISCORD_CLIENT_ID = 'client123';
    process.env.NODE_ENV = 'test';
    const { env } = await import('../../config/env');
    expect(env.DISCORD_TOKEN).toBe('token123');
  });
});
