export function connectOrderSocket(token, onMessage) {
  if (!token) return null;

  const ws = new WebSocket(
    `ws://localhost:8000/ws/orders?token=${token}`
  );

  ws.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (err) => {
    console.error("❌ WebSocket error", err);
  };

  ws.onclose = () => {
    console.log("🔌 WebSocket disconnected");
  };

  return ws;
}
