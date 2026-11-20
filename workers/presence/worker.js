// Live visitor count for siddharthmehta.design. One Durable Object holds every
// open socket, so the number is exactly the tabs that are open right now. It
// stores nothing: no IPs, no ids, no history. The count is the socket count.
export class Room {
  constructor(state) {
    this.state = state;
  }
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    const pair = new WebSocketPair();
    this.state.acceptWebSocket(pair[1]);
    this.broadcast();
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  webSocketClose() {
    this.broadcast();
  }
  webSocketError() {
    this.broadcast();
  }
  broadcast() {
    const sockets = this.state.getWebSockets();
    const msg = JSON.stringify({ n: sockets.length });
    for (const ws of sockets) {
      try {
        ws.send(msg);
      } catch (e) {}
    }
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const ok = /^https:\/\/(www\.)?siddharthmehta\.design$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (!ok) return new Response("forbidden", { status: 403 });
    return env.ROOM.get(env.ROOM.idFromName("site")).fetch(request);
  },
};
