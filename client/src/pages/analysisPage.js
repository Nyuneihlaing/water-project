import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function AnalysisPage() {
    const [pastUsage, setPastUsage] = useState([]);
    
    useEffect(() => {
        // Fetch past usage data from the backend
        const fetchPastUsage = async () => {
            try {
                const response = await fetch('http://localhost:3000/past-usage');
                const data = await response.json();
                setPastUsage(data);
            } catch (error) {
                console.error('Error fetching past usage:', error);
            }
        };
        
        fetchPastUsage();
    }, []);

    const minutesChartData = {
        labels: pastUsage.map((entry) => entry.activity), 
        datasets: [
            {
                label: 'Total Usage (Minutes)',
                data: pastUsage.map((entry) => entry.totalMinutes),
                backgroundColor: 'rgba(54, 162, 235, 0.6)', 
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const litersChartData = {
        labels: pastUsage.map((entry) => entry.activity), 
        datasets: [
            {
                label: 'Total Usage (Liters)',
                data: pastUsage.map((entry) => entry.totalUsageInLiters),
                backgroundColor: 'rgba(255, 99, 132, 0.6)', 
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold text-blue-500 mb-6">Water Usage Analysis</h2>

            {/* Water Usage Data Table */}
            {pastUsage.length > 0 && (
                <>
                    <table className="w-full max-w-4xl bg-white rounded-lg shadow-md mb-6">
                        <thead className="bg-blue-500 text-white">
                            <tr>
                                <th className="p-4">Activity</th>
                                <th className="p-4">Total Usage (Minutes)</th>
                                <th className="p-4">Total Usage (Liters)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastUsage.map((entry) => (
                                <tr key={entry.activity} className="border-t">
                                    <td className="p-4">{entry.activity}</td>
                                    <td className="p-4 text-center">{entry.totalMinutes}</td>
                                    <td className="p-4 text-center">{entry.totalUsageInLiters}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Minutes Chart */}
                    <div className="w-full max-w-4xl mb-8">
                        <Bar data={minutesChartData} options={{ ...chartOptions, title: { text: 'Total Usage (Minutes)' } }} />
                    </div>

                    {/* Liters Chart */}
                    <div className="w-full max-w-4xl">
                        <Bar data={litersChartData} options={{ ...chartOptions, title: { text: 'Total Usage (Liters)' } }} />
                    </div>
                </>
            )}

            {/* Display Error */}
            {pastUsage.length === 0 && (
                <p className="text-red-500 mb-4">No data available</p>
            )}
        </div>
    );
}

export default AnalysisPage;