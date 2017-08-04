import d3 from 'd3';
import nvd3 from 'nvd3';
import moment from 'moment';

Template.requestTimeline.onRendered(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  templateInstance.chartData = new ReactiveVar();

  // Initialize chart
  const chart = nvd3.models.lineChart();

  // Set canvas size. TODO: Generate size basing on window size
  const canvasWidth = 400;
  const canvasHeight = 200;

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
    const elasticsearchData = Template.currentData().aggregations.buckets;

    const allCalls = elasticsearchData.map((value) => {
      return {
        x: value.key,
        y: value.doc_count,
      }
    });

    const successCalls = elasticsearchData.map((value) => {
      return {
        x: value.key,
        y: value.response_status.buckets['success'].doc_count,
      }
    });

    const redirectCalls = elasticsearchData.map((value) => {
      return {
        x: value.key,
        y: value.response_status.buckets['redirect'].doc_count,
      }
    });

    const failCalls = elasticsearchData.map((value) => {
      return {
        x: value.key,
        y: value.response_status.buckets['fail'].doc_count,
      }
    });

    const errorCalls = elasticsearchData.map((value) => {
      return {
        x: value.key,
        y: value.response_status.buckets['error'].doc_count,
      }
    });

    const chartData = [
      {
        values: allCalls,
        key: "All calls: ",
        color: "#aaa",
        strokeWidth: 2,
      },
      {
        values: successCalls,
        key: "2XX calls: ",
        color: "#2ca02c",
        strokeWidth: 2
      },
      {
        values: redirectCalls,
        key: "3XX calls: ",
        color: "#2222ff",
        strokeWidth: 2,
      },
      {
        values: failCalls,
        key: "4XX calls: ",
        color: "#ff7f0e",
        strokeWidth: 2,
      },
      {
        values: errorCalls,
        key: "5XX calls: ",
        color: "#ff0000",
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
