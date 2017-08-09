import d3 from 'd3';
import nvd3 from 'nvd3';
import moment from 'moment';

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

  templateInstance.changePath(buckets[0].key);
});

Template.requestTimeline.onRendered(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  // Initialize chart
  const chart = nvd3.models.lineChart();

  // Set canvas size. TODO: Generate size basing on window size
  const canvasWidth = 800;
  const canvasHeight = 400;

  // Configure chart
  chart
    .xScale(d3.time.scale())
    .showXAxis(true)
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

    const allCalls = [], successCalls = [], redirectCalls = [], failCalls = [], errorCalls = [], labels = [];

    elasticsearchData.forEach(value => {
      labels.push(value.key_as_string);

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

    const chartData = [
      {
        values: allCalls,
        key: "All calls: ",
        color: "#959595",
        strokeWidth: 2,
      },
      {
        values: successCalls,
        key: "2XX calls: ",
        color: "#468847",
        strokeWidth: 2
      },
      {
        values: redirectCalls,
        key: "3XX calls: ",
        color: "#04519b",
        strokeWidth: 2,
      },
      {
        values: failCalls,
        key: "4XX calls: ",
        color: "#e08600",
        strokeWidth: 2,
      },
      {
        values: errorCalls,
        key: "5XX calls: ",
        color: "#b94848",
        strokeWidth: 2,
      }
    ];

    // Update chart data reactive variable
    templateInstance.chartData.set(chartData);
  });

  // Render chart reactively
  templateInstance.autorun(() => {
    // Get chart data from reactive variable
    const chartData = templateInstance.chartData.get();

    if (chartData) {
      const selection = d3.select(`.request-timeline-chart svg`);
      // Render the chart with data
      selection.datum(chartData)
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
        .call(chart);

      // Remove background layout because it's black color by default
      selection.selectAll(".nv-background").remove();

      // Make sure chart is responsive (resize)
      nvd3.utils.windowResize(chart.update);
    }
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
