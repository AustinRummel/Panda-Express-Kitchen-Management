import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

/**
 * @component XReport
 * 
 * A React functional component that fetches and displays an X-Report of total sales since the last Z-Report.
 * The report is shown as a table with sales data, including date, time period, total sales, and order count.
 * The component fetches the data from two API endpoints: one to get the last Z-Report time and another for the sales data.
 * 
 * @memberof module:Frontend/Reports
 * @returns {JSX.Element} A styled div containing the X-Report with a header and a table of sales data.
 */
const XReport = () => {
  const [reportData, setReportData] = useState(null);
  const [lastZReportTime, setLastZReportTime] = useState(null);
  const [error, setError] = useState(null);

  const fetchXReport = async () => {
    try {
      // fetch the last z-report time
      const zReportResponse = await fetch('https://pandabackend-six.vercel.app/api/reports/last-z-report');
      if (!zReportResponse.ok){
          throw new Error('Failed to fetch last Z-Report time');
      } 

      const zReportData = await zReportResponse.json();
      setLastZReportTime(zReportData.lastZReportTime);

      // fetch the sales data since last z-report
      const salesResponse = await fetch('https://pandabackend-six.vercel.app/api/reports/x-report');
      if (!salesResponse.ok){
          throw new Error('Failed to fetch X-Report data');
      }

      const salesData = await salesResponse.json();

      // we must check the types that are passed in so that the data can be displayed correctly
      const parsedData = salesData.map(row => ({
        date: row.date,
        timePeriod: row.time_period,
        totalSales: parseFloat(row.total_sales),
        orderCount: parseInt(row.order_count, 10)
      }));

      setReportData(parsedData);
      
    } 
    catch (err) {
      setError(err.message);
    }
  };

  // keyboard listener to call x-report
  useEffect(() => {
    fetchXReport();
  }, []);

  // error checking to ensure robustness
  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-100 rounded-lg">
        Error generating X-Report: {error}
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Report Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">X-Report: Total Sales Since Last Z-Report</h2>
        <p className="text-gray-600">
          Last Z-Report Run: {lastZReportTime ? format(new Date(lastZReportTime), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
        </p>
      </div>

      {/* Report Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Time Period</th>
              <th className="px-4 py-2 border">Total Sales ($)</th>
              <th className="px-4 py-2 border">Order Count</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => {
              // Check if this is the first row of a new date
              const isNewDate = index === 0 || row.date !== reportData[index - 1].date;
              
              return (
                <tr key={`${row.date}-${row.timePeriod}`} 
                    className={`${isNewDate ? 'border-t-2 border-gray-400' : ''}`}>
                  <td className="px-4 py-2 border">{row.date}</td>
                  <td className="px-4 py-2 border">{row.timePeriod}</td>
                  <td className="px-4 py-2 border text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(row.totalSales)}
                  </td>
                  <td className="px-4 py-2 border text-center">{row.orderCount}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="2" className="px-4 py-2 border font-bold text-right">Totals:</td>
              <td className="px-4 py-2 border text-right font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(reportData.reduce((sum, row) => sum + row.totalSales, 0))}
              </td>
              <td className="px-4 py-2 border text-center font-bold">
                {reportData.reduce((sum, row) => sum + row.orderCount, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default XReport;
