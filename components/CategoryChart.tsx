"use client";

import { PieChart, Pie, Tooltip, Cell } from "recharts";

export default function CategoryChart({ data }: { data: any[] }) {
  return (
    <PieChart width={300} height={300}>
      <Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>
        {data.map((_, i) => (
          <Cell key={i} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}