import React, { useState, useEffect } from 'react';

/**
 * SellsTogether component
 * Displays a report of items that are frequently sold together, with sorting and date range selection.
 * 
 * @component
 * @memberof module:Frontend/Reports
 * @returns {JSX.Element}
 */
const SellsTogether = () => {
    const [pairData, setPairData] = useState([]); // Array of pair data
    const [startDate, setStartDate] = useState(''); // Start date for the report
    const [endDate, setEndDate] = useState(''); // End date for the report
    const [sortOrder, setSortOrder] = useState('desc'); // Sort order for the report
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchPairData = async () => {
            if (!startDate || !endDate) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://pandabackend-six.vercel.app/api/reports/together?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}&order=${sortOrder}`
                );
                if (!response.ok) throw new Error('Failed to fetch pair data');
                const data = await response.json();
                setPairData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPairData();
    }, [startDate, endDate, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === 'desc' ? 'asc' : 'desc'));
    };

    return (
        <div className="mb-4 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">What Sells Together Report</h2>

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
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && <p className="text-gray-500">Loading...</p>}

            {!loading && pairData.length > 0 && (
                <div className="overflow-y-auto" style={{ maxHeight: '800px' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product 1
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product 2
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sold Together Count
                                    <button
                                        onClick={toggleSortOrder}
                                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
                                    >
                                        {sortOrder === 'desc' ? (
                                            <span>&#x25BC;</span>
                                        ) : (
                                            <span>&#x25B2;</span>
                                        )}
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pairData.map((pair, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pair.product_1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pair.product_2}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pair.sold_together_count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && pairData.length === 0 && (
                <p className="text-gray-500">No sales pair data found for the selected dates.</p>
            )}
        </div>
    );
};

export default SellsTogether;
