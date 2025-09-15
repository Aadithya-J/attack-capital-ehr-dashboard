import { jest } from '@jest/globals';

const mockedPost = jest.fn() as jest.MockedFunction<
  (url: string, data?: any, config?: any) => Promise<{ data: { access_token: string; expires_in: number } }>
>;

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: mockedPost,
  },
}));

describe('getModMedToken', () => {
  const EXPIRES_IN_SECONDS = 3600;
  const TOKEN_1 = 'token-123';
  const TOKEN_2 = 'token-456';

  beforeEach(() => {
    jest.resetModules();
    mockedPost.mockReset();
  });

  afterEach(() => {
    if ((Date.now as any)?.mockRestore) {
      try {
        (Date.now as any).mockRestore();
      } catch {
        // ignore
      }
    }
  });

  it('fetches and caches token until expiry', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { access_token: TOKEN_1, expires_in: EXPIRES_IN_SECONDS },
    });

    const { getModMedToken } = await import('@/lib/modmedAuth');

    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);

    const first = await getModMedToken();
    expect(first).toBe(TOKEN_1);
    expect(mockedPost).toHaveBeenCalledTimes(1);

    const second = await getModMedToken();
    expect(second).toBe(TOKEN_1);
    expect(mockedPost).toHaveBeenCalledTimes(1);

    nowSpy.mockRestore();
  });

  it('fetches new token after expiry', async () => {
    let currentTime = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

    mockedPost.mockResolvedValueOnce({
      data: { access_token: TOKEN_1, expires_in: EXPIRES_IN_SECONDS },
    });

    const { getModMedToken } = await import('@/lib/modmedAuth');

    const first = await getModMedToken();
    expect(first).toBe(TOKEN_1);

    const lifetimeMs = (EXPIRES_IN_SECONDS - 60) * 1000 + 1;
    currentTime = lifetimeMs;

    mockedPost.mockResolvedValueOnce({
      data: { access_token: TOKEN_2, expires_in: EXPIRES_IN_SECONDS },
    });

    const second = await getModMedToken();
    expect(second).toBe(TOKEN_2);

    expect(mockedPost).toHaveBeenCalledTimes(2);
  });
});
