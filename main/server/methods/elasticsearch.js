/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Npm packages imports
import ElasticSearch from 'elasticsearch';

Meteor.methods({
  async getElasticsearchData (host, queryParams) {
    // Initialize Elasticsearch client, using provided host value
    const esClient = new ElasticSearch.Client({ host });

    // try {
    //   // ping usually has a 3000ms timeout
    //   await esClient.ping({requestTimeout: 3000})
    //
    //   // Return promise with
    //   return esClient.search(queryParams)
    // } catch (error) {
    //   throw new Meteor.Error(error.message);
    // }

    return esClient
      .ping({
        // ping usually has a 3000ms timeout
        requestTimeout: 3000,
      })
      .then(() => {
        return esClient.search(queryParams);
      })
      .catch(error => {
          // Throw an error
        throw new Meteor.Error(error.message);
      }
      );
  },
});

