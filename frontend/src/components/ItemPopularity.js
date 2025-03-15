import React, { useState, useEffect } from 'react';

/**
 * ItemPopularity component
 * Displays a report of the most popular menu items, with date range selection.
 * @memberof module:Frontend/Reports
 * @returns {JSX.Element}
 */
const ItemPopularity = () => {
    const [popularityData, setPopularityData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [itemLimit, setItemLimit] = useState(10); // Default to top 10 items
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPopularityData = async () => {
            if (!startDate || !endDate) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://pandabackend-six.vercel.app/api/reports/menu-items-popularity?start=${encodeURIComponent(
                        startDate
                    )}&end=${encodeURIComponent(endDate)}&limit=${itemLimit}`
                );
                if (!response.ok) throw new Error('Failed to fetch menu popularity data');
                const data = await response.json();
                setPopularityData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularityData();
    }, [startDate, endDate, itemLimit]);

    return (
        <div className="mb-4 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Menu Items Popularity Analysis</h2>

            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
                    <input
                        type="number"
                        value={itemLimit}
                        onChange={(e) => setItemLimit(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && <p className="text-gray-500">Loading...</p>}

            {!loading && popularityData.length > 0 && (
                <div className="overflow-y-auto" style={{ maxHeight: '800px' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Menu Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Sales
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {popularityData.map((item, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.menu_item}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.total_sales}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && popularityData.length === 0 && (
                <p className="text-gray-500">No popularity data found for the selected dates.</p>
            )}
        </div>
    );
};

export default ItemPopularity;
