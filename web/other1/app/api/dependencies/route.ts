import { NextRequest } from "next/server";
import { getDependencies, registryStats } from "@/lib/repo";
import { CATEGORIES } from "@/data/dependencies";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const data = await getDependencies({ category, q });

  return Response.json({
    blueprint: "VECTOR-ONE // DAW ENGINE",
    version: "4.2.0",
    tracking: "none — all inference and persistence is local",
    stats: registryStats(data),
    strata: CATEGORIES.map((c) => ({
      key: c.key,
      index: c.index,
      title: c.title,
    })),
    data,
  });
}
