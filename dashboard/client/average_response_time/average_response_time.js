import moment from 'moment';
import Chart from 'chart.js';

Template.averageResponseTime.onRendered(function () {
  const elasticsearchData = Template.currentData().aggregations.buckets;
  const attr = this.data.attr;

  const labels = elasticsearchData.map(value => moment(value.key).format('MM/DD'));
  const data  = elasticsearchData.map(value => {
    return {
      x: value.key,
      y: parseInt(value.percentiles_response_time.values['95.0'], 10),
    }
  });

  const ctx = document.querySelector(`[data-overview-id="${attr}"] .average-response-time`).getContext('2d');
  const chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Time, ms',
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
