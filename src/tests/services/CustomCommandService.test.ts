import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomCommandService } from '../../services/CustomCommandService';
import { CustomCommandRepository } from '../../database/repositories/CustomCommandRepository';
import { CustomCommand } from '../../types/CustomCommand';

const mockRepo = {
  create: vi.fn(),
  findByName: vi.fn(),
  findAllByGuild: vi.fn(),
  update: vi.fn(),
  incrementCounter: vi.fn(),
  delete: vi.fn(),
} as unknown as CustomCommandRepository;

describe('CustomCommandService', () => {
  let service: CustomCommandService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CustomCommandService(mockRepo);
  });

  it('creates a command when name is available', async () => {
    vi.mocked(mockRepo.findByName).mockReturnValue(null);
    vi.spyOn(service as unknown as { registerGuildCommand: () => Promise<void> }, 'registerGuildCommand').mockResolvedValue(undefined);
    await service.create({ guild_id: 'g1', name: 'test', type: 'response', text: 'Hello' });
    expect(mockRepo.create).toHaveBeenCalledOnce();
  });

  it('throws when command name already exists', async () => {
    vi.mocked(mockRepo.findByName).mockReturnValue({ name: 'test' } as CustomCommand);
    await expect(
      service.create({ guild_id: 'g1', name: 'test', type: 'response', text: 'Hello' }),
    ).rejects.toThrow('already exists');
  });

  it('resolves counter text with current count', () => {
    const cmd = { type: 'counter', text: 'Latidos: {count}', counter: 5 } as CustomCommand;
    const result = service.resolveText(cmd);
    expect(result).toBe('Latidos: 5');
  });

  it('returns plain text for response type', () => {
    const cmd = { type: 'response', text: 'Hello world', counter: 0 } as CustomCommand;
    expect(service.resolveText(cmd)).toBe('Hello world');
  });
});
