Template.requestsOverTime.onRendered(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  templateInstance.autorun(function () {
    const elasticsearchHost = Template.currentData().elasticsearchHost;

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
            filter: {
              range: {
                request_at: {
                },
              },
            },
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

  });
});
