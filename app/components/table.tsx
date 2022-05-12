// With white background: https://tailwindui.com/components/application-ui/lists/tables
// With white background and borders: https://tailwindui.com/components/application-ui/lists/tables
export function Table({
  headers,
  children,
  decor = "shadow",
}: {
  headers: React.ReactFragment;
  children: React.ReactNode;
  decor?: "shadow" | "edge";
}) {
  // Tailwind UI table with shadow: <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
  // Tailwind UI details table: <div className="overflow-hidden border-t border-gray-200">
  return (
    <div className="lg:-mx-8- -my-2 -mx-4 overflow-x-auto ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
