import moment from 'moment';
import Chart from 'chart.js';

Template.requestTimeline.onCreated(function () {
  const templateInstance = this;

  templateInstance.chartData = new ReactiveVar();
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

Template.requestTimeline.onRendered(function () {
  const templateInstance = this;

  const ctx = document.getElementById("request-timeline-chart").getContext('2d');
  templateInstance.chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    data: {
      labels: [],
      datasets: [],
    },
    // Configuration options go here
    options: {
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
      }
    }
  });

  templateInstance.autorun(() => {
    const aggregationData = templateInstance.elasticsearchData.get();

    const elasticsearchData = aggregationData.requests_over_time.buckets;

    const labels = [],
      allCalls = [],
      successCalls = [],
      redirectCalls = [],
      failCalls = [],
      errorCalls = [];

    elasticsearchData.forEach(value => {
      labels.push(moment(value.key).format('MM/DD'));

      allCalls.push({
        x: value.key,
        y: value.doc_count,
      });

      successCalls.push({
        x: value.key,
        y: value.response_status.buckets['success'].doc_count,
      });

      redirectCalls.push({
        x: value.key,
        y: value.response_status.buckets['redirect'].doc_count,
      });

      failCalls.push({
        x: value.key,
        y: value.response_status.buckets['fail'].doc_count,
      });

      errorCalls.push({
        x: value.key,
        y: value.response_status.buckets['error'].doc_count,
      })
    });

    templateInstance.chart.data = {
      labels: labels,
      datasets: [
        {
          label: "All Calls",
          backgroundColor: '#959595',
          borderColor: '#959595',
          pointBorderColor: '#959595',
          data: allCalls,
          fill: false,
        },
        {
          label: "2XX",
          backgroundColor: '#468847',
          borderColor: '#468847',
          pointBorderColor: '#468847',
          data: successCalls,
          fill: false,
        },
        {
          label: "3XX",
          backgroundColor: '#04519b',
          borderColor: '#04519b',
          pointBorderColor: '#04519b',
          data: redirectCalls,
          fill: false,
        },
        {
          label: "4XX",
          backgroundColor: '#e08600',
          borderColor: '#e08600',
          pointBorderColor: '#e08600',
          data: failCalls,
          fill: false,
        },
        {
          label: "5XX",
          backgroundColor: '#b94848',
          borderColor: '#b94848',
          pointBorderColor: '#b94848',
          data: errorCalls,
          fill: false,
        },
      ],
    };

    templateInstance.chart.update();
  });
});

Template.requestTimeline.helpers({
  listPaths () {
    const buckets = Template.instance().data.buckets;

    return buckets.map(v => v.key);
  }
});

Template.requestTimeline.events({
  'change #requests-path': (event, templateInstance) => {
    const selectedPath = event.currentTarget.value;

    templateInstance.changePath(selectedPath);
  },
});
