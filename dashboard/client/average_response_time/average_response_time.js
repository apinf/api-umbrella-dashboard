import moment from 'moment';
import Chart from 'chart.js';

Template.averageResponseTime.onRendered(function () {
  const elasticsearchData = Template.currentData().aggregations.buckets;

  const data = [], labels = [];

  elasticsearchData.forEach(value => {
    labels.push(moment(value.key).format('MM/DD'));

    data.push({
      x: value.key,
      y: parseInt(value.percentiles_response_time.values['95.0'], 10),
    });
  });

  const ctx = this.$(".average-response-time")['0'].getContext('2d');
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
      }
    }
  });
});
