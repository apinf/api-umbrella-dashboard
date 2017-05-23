// Npm packages imports
import ElasticSearch from 'elasticsearch';

Meteor.methods({
  getElasticsearchData: function (host) {
    // default query parameters
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

    // Initialize Elasticsearch client, using provided host value
    const esClient = new ElasticSearch.Client({ host });

    // Make sure we can connect to Elasticsearch
    esClient.ping({
      // ping usually has a 3000ms timeout
      requestTimeout: 1000
      }, function (error) {
        if (error) {
          console.trace('elasticsearch cluster is down!');
        } else {
          console.log('All is well');
        }
      });
  }
});
