import d3 from 'd3';
import nvd3 from 'nvd3';
import moment from 'moment';

Template.responseTimeTimeline.onCreated(function () {
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

  templateInstance.changePath(buckets[0].key);
});

Template.responseTimeTimeline.onRendered(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  // Initialize chart
  const chart = nvd3.models.lineChart();

  // Set canvas size. TODO: Generate size basing on window size
  const canvasWidth = 400;
  const canvasHeight = 150;

  // Configure chart
  chart
    .xScale(d3.time.scale())
    .showLegend(false)
    .useInteractiveGuideline(true);

  // Configure x-axis settings for chart
  chart.xAxis
    .axisLabel('Days')
    // Format dates in m/d/y format
    .tickFormat(d => moment(d).format('MM/DD'));

  // configure y-axis settings for chart
  chart.yAxis
    .tickFormat(d3.format(',f'));

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

    const chartData = [
      {
        values: responseTimeData,
        key: "Response time: ",
        color: "#aaa",
        strokeWidth: 2,
      },
    ];

    // Update chart data reactive variable
    templateInstance.chartData.set(chartData);
  });

  // Render chart reactively
  // templateInstance.autorun(() => {
  //   // Get chart data from reactive variable
  //   const chartData = templateInstance.chartData.get();
  //
  //   if (chartData) {
  //     const selection = d3.select(`.response-time-timeline-chart svg`);
  //     // Render the chart with data
  //     selection.datum(chartData)
  //       .attr('width', canvasWidth)
  //       .attr('height', canvasHeight)
  //       .call(chart);
  //
  //     // Remove background layout because it's black color by default
  //     selection.selectAll(".nv-background").remove();
  //
  //     // Make sure chart is responsive (resize)
  //     nvd3.utils.windowResize(chart.update);
  //   }
  // });

  templateInstance.autorun(() => {
    const aggregationData = templateInstance.elasticsearchData.get();

    const elasticsearchData = aggregationData.requests_over_time.buckets;

    const allCalls = [], successCalls = [], redirectCalls = [], failCalls = [], errorCalls = [], labels = [];

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

    const ctx = this.$("#myChart")['0'].getContext('2d');
    const chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: labels,
        xAxisID: 'Days',
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
            label: "2XX calls",
            backgroundColor: '#468847',
            borderColor: '#468847',
            pointBorderColor: '#468847',
            data: successCalls,
            fill: false,
          },
          {
            label: "3XX calls",
            backgroundColor: '#04519b',
            borderColor: '#04519b',
            pointBorderColor: '#04519b',
            data: redirectCalls,
            fill: false,
          },
          {
            label: "4XX calls",
            backgroundColor: '#e08600',
            borderColor: '#e08600',
            pointBorderColor: '#e08600',
            data: failCalls,
            fill: false,
          },
          {
            label: "5XX calls",
            backgroundColor: '#b94848',
            borderColor: '#b94848',
            pointBorderColor: '#b94848',
            data: errorCalls,
            fill: false,
          },

        ]
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
