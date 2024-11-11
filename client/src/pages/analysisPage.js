import React, { useEffect, useState } from 'react';

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

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold text-blue-500 mb-6">Water Usage Analysis</h2>

            {/* Water Usage Data Table */}
            {pastUsage.length > 0 && (
                <table className="w-full max-w-4xl bg-white rounded-lg shadow-md">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="p-4">Activity</th>
                            <th className="p-4">Total Usage (Minutes)</th>
                            <th className="p-4">Total Usage (Liters)</th> {/* New column for liters */}
                        </tr>
                    </thead>
                    <tbody>
                        {pastUsage.map((entry) => (
                            <tr key={entry.activity} className="border-t">
                                <td className="p-4">{entry.activity}</td>
                                <td className="p-4 text-center">{entry.totalMinutes}</td>
                                <td className="p-4 text-center">{entry.totalUsageInLiters}</td> {/* Show total usage in liters */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Display Error */}
            {pastUsage.length === 0 && (
                <p className="text-red-500 mb-4">No data available</p>
            )}
        </div>
    );
}

export default AnalysisPage;
