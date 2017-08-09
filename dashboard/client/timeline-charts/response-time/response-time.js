import Chart from 'chart.js';
import moment from 'moment';

Template.responseTimeTimeline.onCreated(function () {
  const templateInstance = this;

  templateInstance.elasticsearchData = new ReactiveVar();
  const buckets = templateInstance.data.buckets;

  templateInstance.changePath = (path) => {
    // find the related data for Path
    const relatedData = buckets.filter((value) => value.key === path);

    // Update chartData
    templateInstance.elasticsearchData.set(relatedData[0]);
  };

  if (buckets.length > 0) {
    templateInstance.changePath(buckets[0].key);
  } else {
    templateInstance.elasticsearchData.set(buckets);
  }
});

Template.responseTimeTimeline.onRendered(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  const ctx = document.getElementById("response-time-timeline-chart").getContext('2d');
  templateInstance.chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    data: {
      labels: [],
      datasets: [],
    },
    // Configuration options go here
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Days',
              fontSize: 14,
              fontColor: '#000000'
            }
          }
        ]
      },
    }
  });

  // Parse chart data reactively
  templateInstance.autorun(() => {
    const aggregationData = templateInstance.elasticsearchData.get();

    const elasticsearchData = aggregationData.requests_over_time.buckets;

    const responseTimeData = elasticsearchData.map((value) => {
      const responseTime = value.percentiles_response_time.values['95.0'];

      return {
        x: value.key,
        y: parseInt(responseTime, 10)
      }
    });

    const labels = elasticsearchData.map(value => {
      return moment(value.key).format('MM/DD');
    });

    templateInstance.chart.data = {
        labels: labels,
        datasets: [{
          label: 'Time, ms',
          backgroundColor: '#959595',
          borderColor: '#959595',
          pointBorderColor: '#959595',
          fill: false,
          data: responseTimeData,
        }]
      };

      templateInstance.chart.update();
  });
});

Template.responseTimeTimeline.helpers({
  listPaths () {
    const buckets = Template.instance().data.buckets;

    return buckets.map(v => v.key);
  }
});

Template.responseTimeTimeline.events({
  'change #requests-path': (event, templateInstance) => {
    const selectedPath = event.currentTarget.value;

    templateInstance.changePath(selectedPath);
  },
});
