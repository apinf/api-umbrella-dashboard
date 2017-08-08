import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating';

import moment from 'moment';

Template.dashboard.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;

  // Create reactive variable for Elasticsearch host & data
  templateInstance.elasticsearchHost = new ReactiveVar('http://nightly.apinf.io:14002');
  templateInstance.elasticsearchData = new ReactiveVar();
  templateInstance.error = new ReactiveVar();

  // Plus one day to include current day in selection
  const today = moment().add(1, 'days').format('YYYY-MM-DD');
  const sevenDaysAgo = moment().subtract(100, 'days').format('YYYY-MM-DD');
  const doubleSevenDaysAgo = moment().subtract(200, 'days').format('YYYY-MM-DD');

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
                      value: '/api-umbrella/v1/analytics/drilldown.json',
                    },
                  }
                },
                {
                  wildcard: {
                    request_path: {
                      // Add '*' to partially match the url
                      value: '/docs/*',
                    },
                  }
                },
                {
                  wildcard: {
                    request_path: {
                      // Add '*' to partially match the url
                      value: '/alternative/rock/*',
                    },
                  }
                },
              ],
            },
          },
          filter: {
            range: {
              request_at: {
                lt: today,
                gte: doubleSevenDaysAgo // Extend request to both interval. It needs to compare two interval
              }
            }
          }
        },
      },
      aggs: {
        // Get summary statistic for each request_path
        group_by_request_path: {
          // get number of calls
          terms: {
            field: 'request_path'
          },
          aggs: {
            // Get statistic for each period(current and previous)
            group_by_interval: {
              range: {
                field: 'request_at',
                keyed : true,
                // includes the *from* value and excludes the *to* value for each range.
                ranges: [
                  {
                    key : 'previousWeek',
                    from: doubleSevenDaysAgo,
                    to: sevenDaysAgo,
                  },
                  {
                    key : 'currentWeek',
                    from: sevenDaysAgo,
                    to: today,
                  },
                ],
              },
              aggs: {
                // get response time for each request_path  and for each period
                response_time: {
                  percentiles: {
                    field: 'response_time',
                    percents: [95]
                  },
                },
                // get user_id for each request_path and for each period
                unique_users: {
                  terms: {
                    field: 'user_id'
                  },
                },
                // get count of success calls (2xx)
                success_status: {
                  range : {
                    field : 'response_status',
                    keyed: true,
                    ranges : [
                      { key: 'success', from : 200, to : 300 },
                      { key: 'error', from : 500, to : 600 },
                    ]
                  }
                },
                // get number of request for each day in week and for each period
                requests_over_time: {
                  date_histogram: {
                    field: 'request_at',
                    interval: 'month',
                  },
                  aggs: {
                    // get the average response time over interval
                    percentiles_response_time: {
                      percentiles: {
                        field: 'response_time',
                        percents: [95]
                      }
                    },
                    unique_users: {
                      terms: {
                        field: 'user_id'
                      },
                    },
                  }
                },
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

        if (error) {
          templateInstance.error.set(error);
          throw Meteor.Error(error)
        }

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
  },
  fetchingData () {
    const templateInstance = Template.instance();
    return templateInstance.elasticsearchData.get() || templateInstance.error.get();
  },
  error () {
    const templateInstance = Template.instance();
    return templateInstance.error.get();
  }
});
