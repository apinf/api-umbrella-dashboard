import d3 from 'd3';
import nvd3 from 'nvd3';
import _ from 'lodash';

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

  // Initialize chart
  const chart = nvd3.models.historicalBarChart();

  // configure chart
  chart
    .xScale(d3.time.scale())
    .margin({left: 100, bottom: 100})
    .showXAxis(true);

  // configure x-axis settings for chart
  chart.xAxis
    .axisLabel('Days')
    // .tickFormat(function (d) {
    //   // Format tickmarks based on timescale
    //   return d3.time.format('%x')(new Date(d))
    // });

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
      const elasticsearchAggregation = elasticsearchData.aggregations.requests_over_time.buckets;
      console.log(elasticsearchAggregation);
      // format object for NVD3 chart
      const chartDataValues = _.map(elasticsearchAggregation, function (datum) {
        // each chart datum should have 'key' and 'values'
        chartDatum = {
          x: datum.key,
          y: datum.doc_count
        };

        return chartDatum;
      });

      const chartData = {
        key: "Requests over time",
        values: chartDataValues
      }

      // Update chart data reactive variable
      templateInstance.chartData.set(chartData);
    }
  });

  // Render chart reactively
  templateInstance.autorun(function () {
    // Get chart data from reactive variable
    const chartData = templateInstance.chartData.get();

    if (chartData) {
      console.log(chartData);
      d3.select('#requests-over-time-chart svg')
        .datum(chartData)
        .call(chart)

      // Make sure chart is responsive (resize)
      nvd3.utils.windowResize(chart.update);
    }
  });
});
