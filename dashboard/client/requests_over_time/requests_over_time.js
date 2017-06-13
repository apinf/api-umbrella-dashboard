Template.requestsOverTime.onRendered(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  templateInstance.elasticsearchData = new ReactiveVar();

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
        data_time: {
          date_histogram: {
            field: 'request_at',
            interval: 'month',
            format: 'dd-MM-yyyy'
          },
        },
      },
    },
  };

  templateInstance.autorun(function () {
    const elasticsearchHost = Template.currentData().elasticsearchHost;

    if (elasticsearchHost) {
      // Get Elasticsearch data
      Meteor.call('getElasticsearchData', elasticsearchHost, queryParams, function (error, result) {
        console.log('error', error);
        console.log('result', result);
      });
    }
  });
});
