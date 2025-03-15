import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

/**
 * @component SalesReport
 * 
 * A React functional component that displays sales report data in the manager inventory view. 
 * It allows users to select a date range, fetch sales data from a server, and view a summary 
 * of total sales as well as detailed sales data in a table format.
 * @memberof module:Frontend/Reports
 * @returns {JSX.Element} A component for viewing sales data with features for date range selection, 
 * error handling, loading state, and a detailed table display.
 */
const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      setError(null);
  
      // Append time to the date if only YYYY-MM-DD is provided
      const formattedStartDate = startDate ? `${startDate} 00:00:00` : '';
      const formattedEndDate = endDate ? `${endDate} 23:59:59` : '';
  
      try {
        const response = await fetch(
          `https://pandabackend-six.vercel.app/api/reports/sales?start=${encodeURIComponent(formattedStartDate)}&end=${encodeURIComponent(formattedEndDate)}`
        );
  
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
  
        const data = await response.json();
        setSalesData(data);
        // calculate total sales based on return value
        const total = data.reduce((sum, item) => sum + Number(item.total_sales), 0);
        setTotalSales(total);
      } 
      catch (err) {
        setError(err.message);
      } 
      finally {
        setLoading(false);
      }
    };
  
    if (startDate && endDate) {
      fetchSalesData();
    }
  }, [startDate, endDate]);

  // Prepare data for the chart
  const chartData = {
    labels: salesData.map(item => item.product_name),
    datasets: [
      {
        label: 'Total Sales ($)',
        data: salesData.map(item => Number(item.total_sales)),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="mb-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Sales Report</h2>

      {/* Date Range Selector */}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4 text-gray-600">
          Loading sales data...
        </div>
      )}

      {/* Sales Data Display */}
      {!loading && salesData.length > 0 && (
        <div>
          {/* Total Sales Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
            <p className="text-2xl font-bold text-red-600">
              Total Sales: ${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Sales Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sales Chart</h3>
            <Bar data={chartData} options={chartOptions} />
          </div>

          {/* Scrollable Sales Table */}
          <div className="overflow-y-auto" style={{ maxHeight: '800px' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sales ($)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(item.total_sales).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!loading && !error && salesData.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Please select a date range to view sales data.
        </div>
      )}
    </div>
  );
};

export default SalesReport;
