import React, { useState, useEffect } from 'react';

/**
 * RestockReport component
 * Displays a list of items that need restocking.
 * @memberof module:Frontend/Reports
 * @returns {JSX.Element}
 */
const RestockReport = () => {
    const [restockData, setRestockData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestockData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('https://pandabackend-six.vercel.app/api/reports/restock');
                if (!response.ok) throw new Error('Failed to fetch restock data');
                const data = await response.json();
                setRestockData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestockData();
    }, []);

    return (
        <div className="mb-4 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Restock Report</h2>

            {loading && <p className="text-gray-500">Loading...</p>}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {!loading && restockData.length > 0 && (
                <div className="overflow-y-auto" style={{ maxHeight: '800px' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Inventory Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Recommended Quantity
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {restockData.map((item, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.inventory_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {Number(item.quantity).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.recommended_quantity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && restockData.length === 0 && (
                <p className="text-gray-500">No data available for restocking.</p>
            )}
        </div>
    );
};

export default RestockReport;
