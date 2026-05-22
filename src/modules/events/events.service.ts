import { prisma } from '../../utils/prisma.js'
import { EventType } from '@prisma/client'

export async function listEvents(filters: { weekday?: string; type?: EventType }) {
  const where: any = {}
  if (filters.weekday) where.weekday = filters.weekday
  if (filters.type) where.type = filters.type
  const events = await prisma.guildEvent.findMany({ where, include: { rsvps: true }, orderBy: { createdAt: 'desc' } })
  // Transform rsvps from relation objects to array of member IDs
  return events.map(({ rsvps, ...event }) => ({
    ...event,
    rsvps: rsvps.map((r: any) => r.memberId),
  }))
}

export async function createEvent(data: any) {
  return prisma.guildEvent.create({ data })
}

export async function updateEvent(id: string, data: any) {
  return prisma.guildEvent.update({ where: { id }, data })
}

export async function deleteEvent(id: string) {
  await prisma.eventRsvp.deleteMany({ where: { eventId: id } })
  return prisma.guildEvent.delete({ where: { id } })
}

export async function toggleRsvp(eventId: string, memberId: string) {
  const existing = await prisma.eventRsvp.findUnique({
    where: { eventId_memberId: { eventId, memberId } },
  })
  if (existing) {
    await prisma.eventRsvp.delete({ where: { id: existing.id } })
    return { joined: false }
  }
  await prisma.eventRsvp.create({ data: { eventId, memberId } })
  return { joined: true }
}
