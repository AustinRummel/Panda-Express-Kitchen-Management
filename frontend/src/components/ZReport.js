/**
 * @module Frontend/Reports
 */
import React, { useState, useCallback } from 'react';

/**
 * @component ZReport
 * 
 * A React functional component that helps generate and display a Z-Report of sales since the last run.
 * The report shows summary details like total sales, total orders, and average order value. 
 * It also provides a button to generate a new Z-Report and update the last run time.
 * 
 * @memberof module:Frontend/Reports
 * @returns {JSX.Element} A styled div containing a button to generate the Z-Report and a summary of the report once generated.
 */
const ZReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generateReport = useCallback(async () => {
    if (window.confirm('Confirm Z-Report? This will update the last run time.')) {
        setLoading(true);
        setError(null);
        
        try {
          // generate new Z-Report
          const reportResponse = await fetch('https://pandabackend-six.vercel.app/api/reports/z-report', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              }
          });

          if (!reportResponse.ok){
              throw new Error('Failed to generate Z-Report');
          } 

          const data = await reportResponse.json();

          // update the last run time after generating the report
          const updateResponse = await fetch('https://pandabackend-six.vercel.app/api/reports/update-last-z-report', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              }
          });

          if (!updateResponse.ok){
              throw new Error('Failed to update last run time');
          }

          // fetch the updated last run time
          const lastRunResponse = await fetch('https://pandabackend-six.vercel.app/api/reports/last-z-report');
          if (!lastRunResponse.ok){
              throw new Error('Failed to fetch last run time');
          } 

          const { lastZReportTime } = await lastRunResponse.json();

          setReportData({
              lastRunTime: lastZReportTime,
              summary: data.summary
          });

        } 
        catch (err) {
            setError(err.message);
        } 
        finally {
            setLoading(false);
        }
    }
}, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-center mb-4">Z-Report: Sales Since Last Run</h2>
        
        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-600 disabled:bg-red-300"
        >
          {loading ? 'Generating...' : 'Generate Z-Report'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error generating Z-Report: {error}
        </div>
      )}

      {reportData && (
        <div className="font-mono text-sm">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-center font-bold mb-4">
              Z-Report Summary
            </div>
            <div className="mb-4 text-gray-600">
              Last Run: {new Date(reportData.lastRunTime).toLocaleString()}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Sales:</span>
                <span className="font-semibold">{formatCurrency(reportData.summary.total_sales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total Orders:</span>
                <span className="font-semibold">{reportData.summary.total_orders}</span>
              </div>
              {reportData.summary.total_orders > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Average Order Value:</span>
                  <span className="font-semibold">
                    {formatCurrency(reportData.summary.total_sales / reportData.summary.total_orders)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZReport;
