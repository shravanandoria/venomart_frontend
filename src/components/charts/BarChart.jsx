import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                interaction: {
                    intersect: false,
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    return <canvas ref={chartRef} />;
};

export default ChartComponent;
