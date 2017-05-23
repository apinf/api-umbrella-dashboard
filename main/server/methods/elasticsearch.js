// Npm packages imports
import ElasticSearch from 'elasticsearch';

Meteor.methods({
  async getElasticsearchData (host) {
    // Placeholder for Elasticsearch data
    let elasticsearchData;

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

    // Check if we can connect to Elasticsearch
    const elasticsearchAccessible = await esClient.ping({
      // ping usually has a 3000ms timeout
      requestTimeout: 1000
      }, function (error) {
        if (error) {
          throw Meteor.Error('Elasticsearch cluster is down.');
          return false;
        } else {
          return true;
        }
      });

    // Make sure Elasticsearch is available
    if (elasticsearchAccessible) {
      // Get Elasticsearch data
      // return data or throw error
      elasticsearchData = await esClient.search(queryParams)
        .then(
          (response) => {
            return response;
          },
          (error) => {
            // Throw an error
            throw new Meteor.Error(error.message);
      });

      return elasticsearchData;
    }
  }
});
