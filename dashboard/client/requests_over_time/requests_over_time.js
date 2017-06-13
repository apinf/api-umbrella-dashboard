import d3 from 'd3';
import nvd3 from 'nvd3';

Template.requestsOverTime.onRendered(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  templateInstance.elasticsearchData = new ReactiveVar();
  templateInstance.chartData = new ReactiveVar();

  const queryParams = {
    size: 0,
    body: {
      query: {
        filtered: {
          query: {
            bool: {
              should: [
                {
                  wildcard: {
                    request_path: {
                      // Add '*' to partially match the url
                      value: '/*',
                    },
                  },
                },
              ],
            },
          },
          // filter: {
          //   range: {
          //     request_at: {
          //     },
          //   },
          // },
        },
      },
      aggs: {
        requests_over_time: {
          date_histogram: {
            field: 'request_at',
            interval: 'month',
            format: 'yyyy-MM-dd'
          },
        },
      },
    },
  };

  // Date formatter for chart
  const tickMultiFormat = d3.time.format.multi([
    ["%-I:%M%p", function(d) { return d.getMinutes(); }], // not the beginning of the hour
    ["%-I%p", function(d) { return d.getHours(); }], // not midnight
    ["%b %-d", function(d) { return d.getDate() != 1; }], // not the first of the month
    ["%b %-d", function(d) { return d.getMonth(); }], // not Jan 1st
    ["%Y", function() { return true; }]
  ]);

  // Initialize chart
  const chart = nvd3.models.historicalBarChart();

  // parse x-axis data
  chart.x(function (datum){
    // Return the timestamp
    return datum.key_as_string;
  });

  // Parse y-axis data
  chart.y(function (datum) {
    console.log(datum);
    // Return the count of requests
    return datum.doc_count;
  });

  // configure chart
  chart
    .xScale(d3.time.scale())
    //.forceX([halfBarXMin, halfBarXMax])
    .margin({left: 100, bottom: 100})
    //.userInteractiveGuideline(true)
    .duration(250)
    .showXAxis(true);

  // configure x-axis settings for chart
  chart.xAxis
    .axisLabel('Days')
    .tickFormat(function (d) { return tickMultiFormat(new Date(d)); });

  // configure y-axis settings for chart
  chart.yAxis
    .axisLabel('Requests');

  // Fetch Elasticsearch data reactively
  templateInstance.autorun(function () {
    const elasticsearchHost = Template.currentData().elasticsearchHost;

    if (elasticsearchHost) {
      // Get Elasticsearch data
      Meteor.call('getElasticsearchData', elasticsearchHost, queryParams, function (error, result) {
        // Update Elasticsearch data reactive variable with result
        templateInstance.elasticsearchData.set(result);
      });
    }
  });

  // Parse chart data reactively
  templateInstance.autorun(function () {
    const elasticsearchData = templateInstance.elasticsearchData.get();

    if (elasticsearchData) {
      // Get aggregations from Elasticsearch data
      const chartData = elasticsearchData.aggregations.requests_over_time.buckets;
      console.log(chartData);
      // Update chart data reactive variable
      templateInstance.chartData.set(chartData);
    }
  });

  // Render chart reactively
  templateInstance.autorun(function () {
    // Get chart data from reactive variable
    const chartData = templateInstance.chartData.get();

    if (chartData) {
      d3.select('#requests-over-time-chart')
        .datum(chartData)
        .transition()
        .call(chart)

      // Make sure chart is responsive (resize)
      nvd3.utils.windowResize(chart.update);
    }
  });
});
