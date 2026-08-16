export interface RefreshedSession {
  accessToken: string | null;
  refreshToken: string | null;
}

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function refreshTokenIfNeeded(
  token: string | null,
  refreshToken: string | null
): Promise<RefreshedSession> {
  if (!token || !refreshToken) {
    return { accessToken: token, refreshToken };
  }

  const expiresAt = decodeJwtExp(token);
  if (expiresAt && Date.now() < expiresAt - 60_000) {
    return { accessToken: token, refreshToken };
  }

  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return { accessToken: null, refreshToken: null };
    }

    const data = (await response.json()) as {
      access_token?: string | null;
      refresh_token?: string | null;
    };

    return {
      accessToken: data.access_token ?? null,
      refreshToken: data.refresh_token ?? refreshToken,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}
