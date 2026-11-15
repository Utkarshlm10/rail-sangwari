import { NextRequest, NextResponse } from "next/server";

// In-memory set of active SSE client streams (Node.js runtime)
type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
};

declare global {
  // eslint-disable-next-line no-var
  var __dispatchClients: Map<string, SSEClient> | undefined;
}

if (!globalThis.__dispatchClients) {
  globalThis.__dispatchClients = new Map<string, SSEClient>();
}

const clients = globalThis.__dispatchClients;

// GET: Subscribe to real-time dispatch events via Server-Sent Events (SSE)
export async function GET(request: NextRequest) {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      clients.set(clientId, { id: clientId, controller });

      // Send initial handshake
      const initialMessage = `event: connected\ndata: ${JSON.stringify({
        status: "connected",
        clientId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));
    },
    cancel() {
      clients.delete(clientId);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// POST: Broadcast dispatch events across all connected passenger & sahayak devices
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    if (!type) {
      return NextResponse.json({ success: false, error: "Missing event type" }, { status: 400 });
    }

    const message = `event: dispatch\ndata: ${JSON.stringify({
      type,
      payload,
      timestamp: new Date().toISOString(),
    })}\n\n`;

    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);

    let sentCount = 0;
    clients.forEach((client, id) => {
      try {
        client.controller.enqueue(encoded);
        sentCount++;
      } catch (err) {
        clients.delete(id);
      }
    });

    return NextResponse.json({
      success: true,
      type,
      clientsNotified: sentCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }
}
