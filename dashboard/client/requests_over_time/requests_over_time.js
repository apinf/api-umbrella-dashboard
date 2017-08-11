/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

import moment from 'moment';
import Chart from 'chart.js';

Template.requestsOverTime.onRendered(function () {
  const elasticsearchData = Template.currentData().aggregations.buckets;
  const attr = this.data.attr;
  const labels = elasticsearchData.map(value => moment(value.key).format('MM/DD'));
  const data = elasticsearchData.map(value => {
    return {
      x: value.key,
      y: value.doc_count,
    };
  });

  const ctx = document.querySelector(`[data-overview-id="${attr}"] .requests-over-time-chart`).getContext('2d');
  const chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels,
      datasets: [
        {
          label: 'Requests',
          backgroundColor: '#959595',
          borderColor: '#959595',
          pointBorderColor: '#959595',
          data,
          fill: false,
        },
      ],
    },

    // Configuration options go here
    options: {
      legend: {
        display: false,
      },
      layout: {
        padding: {
          left: 10,
        },
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
          // gridLines: {
          //   color: 'black'
          // }
        }],
      },

    },
  });
});
