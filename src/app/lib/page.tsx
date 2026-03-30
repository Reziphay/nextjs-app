import { notFound } from "next/navigation";
import { ComponentLibraryPage } from "@/components";

export default function LibPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <ComponentLibraryPage />;
}
