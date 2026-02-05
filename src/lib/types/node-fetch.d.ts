// node-fetch.d.ts
// node-fetch v2 타입 선언
declare module 'node-fetch' {
  export interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;
    json(): Promise<unknown>;
    text(): Promise<string>;
  }

  export interface RequestInit {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }

  export default function fetch(url: string, init?: RequestInit): Promise<Response>;
}
