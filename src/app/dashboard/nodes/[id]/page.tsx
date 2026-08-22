import NodeDetailClient from "./node-detail-client";

export function generateStaticParams() {
  return [
    { id: "ESP-NODE-01" },
    { id: "ESP-NODE-02" },
    { id: "ESP-NODE-03" },
    { id: "ESP-NODE-04" },
    { id: "ESP-NODE-05" },
    { id: "ESP-NODE-06" },
  ];
}

export default async function NodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <NodeDetailClient nodeId={resolvedParams.id} />;
}
