import { getDependencies } from "@/lib/repo";
import Blueprint from "@/components/blueprint";

export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const deps = await getDependencies({});
  return <Blueprint deps={deps} />;
}
