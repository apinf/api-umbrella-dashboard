import d3 from 'd3';
import nvd3 from 'nvd3';
import moment from 'moment';

Template.requestsOverTime.onRendered(function () {
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
    .x(d => d.key)
    .y(d => d.doc_count)
    .xScale(d3.time.scale())
    .showXAxis(true)
    .showLegend(false)
    .useInteractiveGuideline(true);

  // Configure x-axis settings for chart
  chart.xAxis
    .axisLabel('Days')
    // Format dates in m/d/y format
    .tickFormat(d => moment(d).format('MM/DD'));

  // configure y-axis settings for chart
  chart.yAxis
    .axisLabel('Requests');

  // Parse chart data reactively
  templateInstance.autorun(() => {
    const elasticsearchData = Template.currentData().aggregations.buckets;

    const chartData = [
      {
        key: "Requests over time",
        values: elasticsearchData,
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
      const selection = d3.select(`[data-id="${templateInstance.data.attr}"] .requests-over-time-chart svg`);
      // Render the chart with data
      selection.datum(chartData)
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
        .call(chart);

      // Remove background layout because it's black color by default
      selection.selectAll(".nv-background").remove();
      // Remove fill
      selection.selectAll(".nv-line").style("fill", "none");

      // Make sure chart is responsive (resize)
      nvd3.utils.windowResize(chart.update);
    }
  });
});
