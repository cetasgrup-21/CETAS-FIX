import { prisma } from "@/lib/prisma";
import { INITIAL_UNIFIED_EVENTS, UnifiedEvent } from "@/lib/events-unified-data";
import { INITIAL_EVENT_VOTINGS, EventVotingConfig } from "@/lib/vote-unified-data";
import { INITIAL_UNIFIED_PRODUCTS, UnifiedProduct } from "@/lib/production-unified-data";
import { INITIAL_ATTENDEES, RegisteredAttendee } from "@/lib/events-registration-data";

declare global {
  var __cetasTableInitialized: boolean | undefined;
  var __cetasMemoryFallback: Record<string, unknown> | undefined;
}

if (!global.__cetasMemoryFallback) {
  global.__cetasMemoryFallback = {};
}

async function ensureCetasStoreTable(): Promise<void> {
  if (global.__cetasTableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CetasStore" (
        "key" TEXT PRIMARY KEY,
        "value" JSONB NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    global.__cetasTableInitialized = true;
  } catch (err) {
    console.error("Failed to ensure CetasStore table:", err);
  }
}

export async function getStoreData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    await ensureCetasStoreTable();
    const rows = await prisma.$queryRawUnsafe<Array<{ value: T }>>(
      `SELECT "value" FROM "CetasStore" WHERE "key" = $1 LIMIT 1`,
      key
    );

    if (rows && rows.length > 0 && rows[0].value !== undefined && rows[0].value !== null) {
      const rawVal: unknown = rows[0].value;
      let parsedVal: T = rawVal as T;
      if (typeof rawVal === "string") {
        try {
          parsedVal = JSON.parse(rawVal) as T;
        } catch {}
      }
      global.__cetasMemoryFallback![key] = parsedVal;
      return parsedVal;
    }

    // Seed initial default value into PostgreSQL so all instances share the same baseline
    await setStoreData(key, defaultValue);
    return defaultValue;
  } catch (err) {
    console.error(`getStoreData(${key}) error, using fallback:`, err);
    if (global.__cetasMemoryFallback && global.__cetasMemoryFallback[key] !== undefined) {
      return global.__cetasMemoryFallback[key] as T;
    }
    global.__cetasMemoryFallback![key] = defaultValue;
    return defaultValue;
  }
}

export async function setStoreData<T>(key: string, value: T): Promise<void> {
  global.__cetasMemoryFallback![key] = value;
  try {
    await ensureCetasStoreTable();
    const jsonString = JSON.stringify(value);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "CetasStore" ("key", "value", "updatedAt")
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT ("key")
       DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = CURRENT_TIMESTAMP`,
      key,
      jsonString
    );
  } catch (err) {
    console.error(`setStoreData(${key}) error:`, err);
  }
}

// Typed Store Helpers
export async function getEventsStore(): Promise<UnifiedEvent[]> {
  return getStoreData<UnifiedEvent[]>("cetas_events_v1", INITIAL_UNIFIED_EVENTS);
}

export async function saveEventsStore(events: UnifiedEvent[]): Promise<void> {
  await setStoreData<UnifiedEvent[]>("cetas_events_v1", events);
}

export async function getVotingsStore(): Promise<EventVotingConfig[]> {
  return getStoreData<EventVotingConfig[]>("cetas_votings_v1", INITIAL_EVENT_VOTINGS);
}

export async function saveVotingsStore(votings: EventVotingConfig[]): Promise<void> {
  await setStoreData<EventVotingConfig[]>("cetas_votings_v1", votings);
}

export async function getProductsStore(): Promise<UnifiedProduct[]> {
  return getStoreData<UnifiedProduct[]>("cetas_products_v1", INITIAL_UNIFIED_PRODUCTS);
}

export async function saveProductsStore(products: UnifiedProduct[]): Promise<void> {
  await setStoreData<UnifiedProduct[]>("cetas_products_v1", products);
}

export async function getAttendeesStore(): Promise<RegisteredAttendee[]> {
  return getStoreData<RegisteredAttendee[]>("cetas_attendees_v1", INITIAL_ATTENDEES);
}

export async function saveAttendeesStore(attendees: RegisteredAttendee[]): Promise<void> {
  await setStoreData<RegisteredAttendee[]>("cetas_attendees_v1", attendees);
}
