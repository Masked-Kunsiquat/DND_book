import { Card } from "flowbite-react";

interface StatCardProps {
  title: string;
  count: number;
  onClick?: () => void; // ✅ Allow an optional click handler
}

export function StatCard({ title, count, onClick }: StatCardProps) {
  return (
    <Card
      className="text-center shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition"
      onClick={onClick} // ✅ Attach onClick event
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{count}</p>
    </Card>
  );
}
