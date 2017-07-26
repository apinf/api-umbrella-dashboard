// Npm packages imports
import ElasticSearch from 'elasticsearch';

Meteor.methods({
  async getElasticsearchData (host, queryParams) {
    // Placeholder for Elasticsearch data
    let elasticsearchData;

    // Initialize Elasticsearch client, using provided host value
    const esClient = new ElasticSearch.Client({ host });

    // Check if we can connect to Elasticsearch
    const elasticsearchAccessible = await esClient.ping({
      // ping usually has a 3000ms timeout
      requestTimeout: 1000
    })
    .then(
      (response) => {
        // Elasticsearch is accessible
        return true;
      },
      (error) => {
        // Throw an error
        throw new Meteor.Error(error.message);
        return false;
      }
    )

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
  },
});
