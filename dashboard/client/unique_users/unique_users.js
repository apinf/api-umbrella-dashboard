import moment from 'moment';
import Chart from 'chart.js';

Template.uniqueUsersOverTime.onRendered(function () {
  const elasticsearchData = Template.currentData().aggregations.buckets;

  const labels = elasticsearchData.map(value => moment(value.key).format('MM/DD'));
  const data  = elasticsearchData.map(value => {
    return {
      x: value.key,
      y: value.unique_users.buckets.length,
    }
  });

  const ctx = document.querySelector(`[data-overview-id="${this.data.attr}"] .unique-users-time-chart`).getContext('2d');
  const chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Users',
          backgroundColor: '#959595',
          borderColor: '#959595',
          pointBorderColor: '#959595',
          data: data,
          fill: false,
        }
      ]
    },

    // Configuration options go here
    options: {
      legend: {
        display: false
      },
      layout: {
        padding: {
          left: 10,
        }
      }
    }
  });
});
