export interface MCPClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export class MCPClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: MCPClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`MCP request failed: ${response.status} ${response.statusText} ${text}`);
    }

    return (await response.json()) as T;
  }

  quote(payload: unknown) {
    return this.request('/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  start(payload: unknown) {
    return this.request('/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  submit(payload: unknown) {
    return this.request('/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  status(jobId: string) {
    return this.request(`/status/${encodeURIComponent(jobId)}`, {
      method: 'GET',
    });
  }
}
