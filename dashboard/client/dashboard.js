import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating';

import moment from 'moment';

Template.dashboard.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;

  // Create reactive variable for Elasticsearch host & data
  templateInstance.elasticsearchHost = new ReactiveVar('http://nightly.apinf.io:14002');
  templateInstance.elasticsearchData = new ReactiveVar();

  // Create interval Last 7 days
  const today = moment().format('YYYY-MM-DD');
  const sevenDaysAgo = moment().subtract(17, 'days').format('YYYY-MM-DD');

  const queryParams = {
    size: 0,
    body: {
      query: {
        filtered: {
          query: {
            bool: {
              // TODO: Create an automatical generation of a request_path list
              should: [
                {
                  wildcard: {
                    request_path: {
                      // Add '*' to partially match the url
                      value: '/gaagol/*',
                    },
                  },
                },
                {
                  wildcard: {
                    request_path: {
                      // Add '*' to partially match the url
                      value: '/api-umbrella/*',
                    },
                  }
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
      aggs: {
        // Get summary statisctic for each request_path
        group_by_request_path: {
          // get numberof calls
          terms: {
            field: 'request_path'
          },
          aggs: {
            // get response time for each request_path
            response_time: {
              percentiles: {
                field: 'response_time',
                percents: [95]
              }
            },
            // get user_id for each request_path
            unique_users: {
              terms: {
                field: 'user_id'
              }
            },
            // get number of request for each day in week
            requests_over_time: {
              date_histogram: {
                field: 'request_at',
                interval: 'day',
              },
              aggs: {
                percentiles_response_time: {
                  percentiles: {
                    field: 'response_time',
                    percents: [95]
                  }
                }
              }
            },
          },
        },
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
