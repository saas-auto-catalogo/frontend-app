import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpClient } from './httpClient.js';
import { impersonationService } from './impersonationService.js';

describe('impersonationService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve chamar POST /auth/impersonate/end com corpo vazio e retornar mensagem de sucesso', async () => {
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      message: 'Sessão de impersonation encerrada com sucesso.',
    });

    const result = await impersonationService.endImpersonation();

    expect(postSpy).toHaveBeenCalledWith('/auth/impersonate/end', {});
    expect(result.message).toBe('Sessão de impersonation encerrada com sucesso.');
  });

  it('deve propagar erro lançado pelo httpClient caso a requisição falhe', async () => {
    vi.spyOn(httpClient, 'post').mockRejectedValueOnce(new Error('Network error'));

    await expect(impersonationService.endImpersonation()).rejects.toThrow('Network error');
  });
});
