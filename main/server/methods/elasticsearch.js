// Npm packages imports
import ElasticSearch from 'elasticsearch';

Meteor.methods({
  async getElasticsearchData (host, queryParams) {
    // Initialize Elasticsearch client, using provided host value
    const esClient = new ElasticSearch.Client({ host });

    return await esClient
      .ping({
        // ping usually has a 3000ms timeout
        requestTimeout: 1000
      })
      .then(() => {
        return esClient.search(queryParams)
      })
      .then(response => response)
      .catch(error => {
          // Throw an error
          throw new Meteor.Error(error.message);
        }
      );
  },
});
