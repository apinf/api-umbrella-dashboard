import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating';

import moment from 'moment';

Template.dashboard.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;

  // Create reactive variable for Elasticsearch host & data
  templateInstance.elasticsearchHost = new ReactiveVar();
  templateInstance.elasticsearchData = new ReactiveVar();

  // Create interval Last 7 days
  const today = moment().format('YYYY-MM-DD');
  const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');

  const queryParams = {
    size: 5000,
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
                lte: today,
                gte: sevenDaysAgo
              }
            }
          }
        },
      },
      // Get 'user_id' field for calculating number of Unique users
      fields: ['user_id'],
      aggs: {
        // Interval is day, date range is week
        requests_over_time: {
          date_histogram: {
            field: 'request_at',
            interval: 'day',
          },
          aggs: {
            // Get 95 percentiles (average) response time for each specified interval (day, week or month and etc)
            percentiles_response_time: {
              percentiles: {
                field: 'response_time',
                percents: [95]
              }
            }
          }
        },
        // Calculate summary average response time for specified date range
        total_avg_response_time: {
          avg: {
            field: 'response_time'
          }
        }
      },
    },
  };

  // Fetch Elasticsearch data reactively
  templateInstance.autorun(() => {
    const elasticsearchHost = templateInstance.elasticsearchHost.get();

    if (elasticsearchHost) {
      // Get Elasticsearch data
      Meteor.call('getElasticsearchData', elasticsearchHost, queryParams, (error, result) => {
        // Update Elasticsearch data reactive variable with result
        templateInstance.elasticsearchData.set(result);
      });
    }
  });
});


Template.dashboard.helpers({
  elasticsearchData () {
    // Get reference to template instance
    const templateInstance = Template.instance();

    // Return value of Elasticsearch host
    return templateInstance.elasticsearchData.get();
  }
});

Template.dashboard.events({
  'submit #elasticsearch-host' (event, templateInstance) {
    // prevent default form action
    event.preventDefault();

    // Get Elasticsearch host from form
    const host = event.target.host.value;

    // Update Elasticsearch host reactive variable
    templateInstance.elasticsearchHost.set(host);
  }
});
