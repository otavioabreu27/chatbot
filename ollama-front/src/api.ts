import type { ChatMessage } from './types'

// src/api.ts
export async function streamChat(messages: ChatMessage[], onToken: (t: string) => void) {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok || !res.body) throw new Error(`Falha no stream: ${res.status} ${res.statusText}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Processa eventos SSE completos (separados por linha em branco)
    let sep;
    while ((sep = buffer.indexOf('\n\n')) >= 0) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      for (const line of rawEvent.split('\n')) {
        // NÃO use trim()/trimEnd() aqui!
        if (line.startsWith('data:')) {
          const payload = line.slice(5);      // mantém tudo após "data:"
          // algumas libs enviam "data:␠" (com espaço logo após os dois pontos). Se quiser remover só esse único espaço:
          // const payload = line.startsWith('data: ') ? line.slice(6) : line.slice(5);

          if (payload === '[DONE]') return;
          onToken(payload);
        }
        // se quiser, trate "event: error" no seu componente
      }
    }
  }
}

