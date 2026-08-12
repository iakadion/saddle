import { db } from "@/db";
import { dependencies } from "@/db/schema";
import { DEPENDENCIES, type CategoryKey, type Dependency } from "@/data/dependencies";
import { count, eq, asc } from "drizzle-orm";

export interface DependencyQuery {
  category?: string | null;
  q?: string | null;
}

let seedAttempted = false;

async function ensureSeeded(): Promise<void> {
  try {
    const rows = await db.select({ value: count() }).from(dependencies);
    const existing = rows[0]?.value ?? 0;
    if (existing >= DEPENDENCIES.length) return;
    await db
      .insert(dependencies)
      .values(
        DEPENDENCIES.map((d) => ({
          ordinal: d.ordinal,
          category: d.category,
          name: d.name,
          pkg: d.pkg,
          version: d.version,
          purpose: d.purpose,
          description: d.description,
          platforms: d.platforms,
          license: d.license,
        })),
      )
      .onConflictDoNothing();
  } catch {
    // Table may not exist yet (push pending) — callers fall back to static data.
  } finally {
    seedAttempted = true;
  }
}

function applyFilters(list: Dependency[], query: DependencyQuery): Dependency[] {
  let out = list;
  if (query.category && query.category !== "all") {
    out = out.filter((d) => d.category === (query.category as CategoryKey));
  }
  if (query.q) {
    const q = query.q.trim().toLowerCase();
    if (q.length > 0) {
      out = out.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.pkg.toLowerCase().includes(q) ||
          d.purpose.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.platforms.some((p) => p.toLowerCase().includes(q)) ||
          d.license.toLowerCase().includes(q),
      );
    }
  }
  return out;
}

/**
 * Reads the registry from PostgreSQL (seeding it on first contact), falling
 * back to the static manifest so the UI and API are never blocked by the
 * database lifecycle.
 */
export async function getDependencies(query: DependencyQuery = {}): Promise<Dependency[]> {
  if (!seedAttempted) await ensureSeeded();
  try {
    const rows =
      query.category && query.category !== "all"
        ? await db
            .select()
            .from(dependencies)
            .where(eq(dependencies.category, query.category))
            .orderBy(asc(dependencies.ordinal))
        : await db.select().from(dependencies).orderBy(asc(dependencies.ordinal));
    if (rows.length > 0) {
      const mapped: Dependency[] = rows.map((r) => ({
        ordinal: r.ordinal,
        category: r.category as CategoryKey,
        name: r.name,
        pkg: r.pkg,
        version: r.version,
        purpose: r.purpose,
        description: r.description,
        platforms: r.platforms,
        license: r.license,
      }));
      return applyFilters(mapped, { ...query, category: "all" });
    }
  } catch {
    // fall through to static manifest
  }
  return applyFilters(DEPENDENCIES, query);
}

export function registryStats(list: Dependency[]) {
  const byCategory = new Map<string, number>();
  for (const d of list) byCategory.set(d.category, (byCategory.get(d.category) ?? 0) + 1);
  return {
    total: list.length,
    categories: Object.fromEntries(byCategory),
  };
}
