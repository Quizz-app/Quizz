import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto';

const BarChart = ({ data }) => {
    const chartData = {
        labels: ['Week1', 'Week2', 'Week3', 'Week4'],
        datasets: [
            {
                label: 'Weekly Average Score',
                data: data.map(el => el),
                backgroundColor: 'rgb(173, 255, 47)', // bright greenish-yellow color
            }
        ]
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        animation: {
            duration: 2000, // duration of the animation in milliseconds
            easing: 'easeInOutCubic', // easing function to use 'easeInOutQuint'
                    
        }
    };

    return <Bar data={chartData} options={chartOptions} />;
};

export default BarChart;

BarChart.propTypes = {
    data: PropTypes.array.isRequired,
};