interface StatsTableProps {
  data: { year: number; ppg: number; rpg: number; apg: number }[];
}

export default function StatsTable({ data }: StatsTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Year
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            PPG
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            RPG
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            APG
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((r) => (
          <tr key={r.year}>
            <td className="px-4 py-2">{r.year}</td>
            <td className="px-4 py-2">
              {typeof r.ppg === "number" ? r.ppg.toFixed(1) : r.ppg}
            </td>
            <td className="px-4 py-2">
              {typeof r.rpg === "number" ? r.rpg.toFixed(1) : r.rpg}
            </td>
            <td className="px-4 py-2">
              {typeof r.apg === "number" ? r.apg.toFixed(1) : r.apg}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
