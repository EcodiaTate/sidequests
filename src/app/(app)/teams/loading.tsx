import { LoadingGrid } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <div className="mb-8 h-8 w-1/2 animate-pulse rounded bg-gray-200" />
      <LoadingGrid count={4} />
    </div>
  );
}
