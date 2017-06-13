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
            format: 'dd-MM-yyyy'
          },
        },
      },
    },
  };

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

      // Update chart data reactive variable
      templateInstance.chartData.set(chartData);
    }
  });
});
