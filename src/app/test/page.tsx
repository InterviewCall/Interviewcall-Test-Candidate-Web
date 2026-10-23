import type { Metadata } from "next";
import { Portal } from "@/features/portal/portal";

export const metadata: Metadata = { title: "Your test" };

export default function TestPage() {
  return <Portal />;
}
