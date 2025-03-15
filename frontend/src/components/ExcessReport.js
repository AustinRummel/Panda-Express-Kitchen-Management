import React, { useState, useEffect } from 'react';

/**
 * Displays a list of items that sold less than 10% of the their quantity between the timestamp and the current time
 * @memberof module:Frontend/Reports
 * @returns {JSX.Element}
 */
const ExcessReport = () => {
  const [excessData, setExcessData] = useState([]);
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExcessData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://pandabackend-six.vercel.app/api/reports/excess?timestamp=${encodeURIComponent(timestamp)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch excess data');
        }

        const data = await response.json();
        setExcessData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (timestamp) fetchExcessData();
  }, [timestamp]);

  return (
    <div className="mb-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Excess Report</h2>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Timestamp</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-gray-600">
          Loading excess data...
        </div>
      )}

      {!loading && excessData.length > 0 && (
        <div>
          <div className="overflow-y-auto" style={{ maxHeight: '800px' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventory Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sold Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {excessData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.inventory_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.total_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sold_percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && excessData.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No excess inventory found for the selected timestamp.
        </div>
      )}
    </div>
  );
};

export default ExcessReport;
