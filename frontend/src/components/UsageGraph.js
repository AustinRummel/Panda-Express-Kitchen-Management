import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { format } from 'date-fns';

/**
 * @component UsageGraph
 * 
 * A React functional component that displays a bar chart of product usage data
 * for a specified inventory type over a selected date range. The graph is rendered
 * using Chart.js and dynamically updates based on the provided props.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.inventoryType - The type of inventory to display usage data for 
 *                                        (e.g., 'protein', 'sides', 'sauces').
 * @param {string} props.startDate - The start date for fetching usage data in 'YYYY-MM-DD' format.
 * @param {string} props.endDate - The end date for fetching usage data in 'YYYY-MM-DD' format.
 * 
 * @memberof module:Frontend/Reports
 * @returns {JSX.Element} A div containing a canvas element where the chart is rendered.
 */
const UsageGraph = ({ inventoryType, startDate, endDate }) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {

    const fetchUsageData = async () => {
      try {

        // Append time to the date if only YYYY-MM-DD is provided
        const formattedStartDate = startDate ? `${startDate} 00:00:00` : '';
        const formattedEndDate = endDate ? `${endDate} 23:59:59` : '';

        // Get usage data from the database with formatted dates
        const usageResponse = await fetch(
          `https://pandabackend-six.vercel.app/api/inventory/usage?type=${encodeURIComponent(inventoryType)}&start=${encodeURIComponent(formattedStartDate)}&end=${encodeURIComponent(formattedEndDate)}`
        );

        if (!usageResponse.ok) {
          throw new Error(`Usage data fetch failed: ${usageResponse.status}`);
        }

        const usageData = await usageResponse.json();
        console.log('Received usage data:', usageData);

        if (!usageData || usageData.length === 0) {
          console.log('No usage data received');
          return;
        }

        // Prepare the labels for the graph
        const labels = usageData.map((item) => item.inventory_name);
        const values = usageData.map((item) => item.total_used);

        console.log('Processed data:', { labels, values });

        // Delete previous chart
        if (chartRef.current) {
          chartRef.current.destroy();
        }      
        const ctx = canvasRef.current.getContext('2d');

        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Total Usage',
                data: values,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    let unitLabel = 'units'; // Default unit
                    if (inventoryType === 'protein' || inventoryType === 'sides' || inventoryType === 'produce' || inventoryType === 'other') {
                      unitLabel = 'lbs';
                    } 
                    else if (inventoryType === 'sauces') {
                      unitLabel = 'galloons';
                    }
                    
                    return `${value} ${unitLabel}`;
                  },
                },
              },
            },
          },
        });
        
      } 
      catch (error) {
        console.error('Error in fetchUsageData:', error);
      }
    };

    fetchUsageData();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [inventoryType, startDate, endDate]);

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default UsageGraph;
