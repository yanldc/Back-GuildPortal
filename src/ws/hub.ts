import { WebSocket } from 'ws'

export type WsEvent =
  | 'auctions:updated'
  | 'events:updated'
  | 'members:updated'
  | 'transactions:updated'
  | 'levelup:updated'

const clients = new Set<WebSocket>()

export function addClient(ws: WebSocket) {
  clients.add(ws)
  ws.on('close', () => clients.delete(ws))
  ws.on('error', () => clients.delete(ws))
}

export function broadcast(event: WsEvent, data?: any) {
  const message = JSON.stringify({ event, data })
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  }
}
