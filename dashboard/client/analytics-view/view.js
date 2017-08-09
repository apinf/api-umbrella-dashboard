import moment from 'moment';

import { arrowDirection, percentageValue, summaryComparing, calculateTrend } from '../compare_indicating';

Template.apiAnalyticsView.helpers({
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
  },
  arrowDirection (parameter) {
    // Provide compared data
    return arrowDirection(parameter, this);
  },
  percentages (parameter) {
    // Provide compared data
    return percentageValue(parameter, this);
  },
  summaryComparing (parameter) {
    return summaryComparing(parameter, this)
  },
  proxyBackendPath () {
    return FlowRouter.getParam('id');
  },
  bucket () {
    const templateInstance = Template.instance();
    // Get ES data
    const elasticsearchData = templateInstance.elasticsearchData.get();
    const currentPeriodBucket = elasticsearchData.aggregations.group_by_interval.buckets['currentWeek'];

    const requestNumber = currentPeriodBucket.doc_count;
    const responseTime = parseInt(currentPeriodBucket.response_time.values['95.0'], 10);
    const uniqueUsers = currentPeriodBucket.unique_users.buckets.length;

    const successCallsCount = currentPeriodBucket.response_status.buckets['success'].doc_count;
    const redirectCallsCount = currentPeriodBucket.response_status.buckets['redirect'].doc_count;
    const failCallsCount = currentPeriodBucket.response_status.buckets['fail'].doc_count;
    const errorCallsCount = currentPeriodBucket.response_status.buckets['error'].doc_count;

    const previousPeriodBucket = elasticsearchData.aggregations.group_by_interval.buckets['previousWeek'];
    // Get the statistics comparing between previous and current periods
    const compareRequests = calculateTrend(previousPeriodBucket.doc_count, requestNumber);
    const compareResponse = calculateTrend(
      parseInt(previousPeriodBucket.response_time.values['95.0'], 10), responseTime
    );
    const compareUsers = calculateTrend(
      previousPeriodBucket.unique_users.buckets.length, uniqueUsers
    );

    const response = {
      // TODO: Instead of attr create an unique ID. It needs to create an unique selector for SVG chart
      requestNumber,
      responseTime,
      uniqueUsers,
      callsCount: {
        success: successCallsCount,
        redirect: redirectCallsCount,
        fail: failCallsCount,
        error: errorCallsCount
      },
      compareRequests,
      compareResponse,
      compareUsers,
      requestOverTime: currentPeriodBucket.requests_over_time
    };

    return response;
  },
  timelineData () {
    const templateInstance = Template.instance();
    // Get ES data
    const elasticsearchData = templateInstance.elasticsearchData.get();
    const currentPeriodBucket = elasticsearchData.aggregations.group_by_interval.buckets['currentWeek'];

    return currentPeriodBucket.group_by_request_path.buckets
  },
  mostFrequentUsers () {
    const templateInstance = Template.instance();
    // Get ES data
    const elasticsearchData = templateInstance.elasticsearchData.get();
    const currentPeriodBucket = elasticsearchData.aggregations.group_by_interval.buckets['currentWeek'];

    return currentPeriodBucket.most_frequent_users.buckets;
  },
});

Template.apiAnalyticsView.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;
  templateInstance.elasticsearchData = new ReactiveVar();
  templateInstance.error = new ReactiveVar();

  // TODO: get the relative proxy host
  const elasticsearchHost = 'http://nightly.apinf.io:14002';
  const proxyBackendPath = FlowRouter.getParam('id');

  const today = moment().add(1, 'days').format('YYYY-MM-DD');// Plus one day to include current day in selection
  const sevenDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const doubleSevenDaysAgo = moment().subtract(60, 'days').format('YYYY-MM-DD');

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
                      value: `${proxyBackendPath}*`
                    },
                  },
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
        // Get statistic for current period and previous period
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
          // Get data for each period
          aggs: {
            // Get data over interval: number of requests, percentiles of response time, unique users

            // Number of requests over interval
            requests_over_time: {
              date_histogram: {
                field: 'request_at',
                interval: 'day',
              },
              aggs: {
                // Percentiles of response time over interval
                percentiles_response_time: {
                  percentiles: {
                    field: 'response_time',
                    percents: [95]
                  }
                },
                // Count of Unique users over interval
                unique_users: {
                  terms: {
                    field: 'user_id'
                  },
                },
              }
            },
            // Get total count for general request_path:
            // percentiles of response time, unique users, response status

            // Get total Percentiles of response time
            response_time: {
              percentiles: {
                field: 'response_time',
                percents: [95]
              },
            },
            // Get total count of unique users
            unique_users: {
              terms: {
                field: 'user_id'
              },
            },
            // Get total count of each response status
            response_status: {
              range : {
                field : 'response_status',
                keyed: true,
                ranges : [
                  { key: 'success', from : 200, to : 300 },
                  { key: 'redirect', from : 300, to : 400 },
                  { key: 'fail', from : 400, to : 500 },
                  { key: 'error', from : 500, to : 600 },
                ]
              }
            },
            // Get data about each called request_path
            group_by_request_path: {
              // Get all called request_path
              terms: {
                field: 'request_path'
              },
              // Get data for each request_path
              aggs: {
                // Get data over interval: number of requests, percentiles of response time, Response statuses

                // Number of requests over interval
                requests_over_time: {
                  date_histogram: {
                    field: 'request_at',
                    interval: 'day',
                  },
                  aggs: {
                    // Percentiles of response time over interval
                    percentiles_response_time: {
                      percentiles: {
                        field: 'response_time',
                        percents: [95]
                      }
                    },
                    // Response statuses of requests over interval
                    response_status: {
                      range : {
                        field : 'response_status',
                        keyed: true,
                        ranges : [
                          { key: 'success', from : 200, to : 300 },
                          { key: 'redirect', from : 300, to : 400 },
                          { key: 'fail', from : 400, to : 500 },
                          { key: 'error', from : 500, to : 600 },
                        ]
                      }
                    },
                  }
                },
                // Get total Percentiles of response time for each request_path
                response_time: {
                  percentiles: {
                    field: 'response_time',
                    percents: [95]
                  },
                },
                errors_statistic: {
                  // Get only response with error status code
                  filter: {
                    range: {
                      response_status: {
                        gte: 400,
                      }
                    }
                  },
                  aggs: {
                    // Get date detailed by minute. Timestamp- key
                    errors_over_time: {
                      date_histogram: {
                        field: 'request_at',
                        interval: 'minute',
                      },
                      aggs: {
                        // Return values of errors status code. Calls - doc_count, code - key
                        status: {
                          terms: {
                            field: 'response_status'
                          }
                        },
                      }
                    },
                  }
                },
              },
            },
            most_frequent_users: {
              terms: {
                field: 'user_id'
              },
              aggs: {
                // Get user e-mail (key)
                user_email: {
                  terms: {
                    field: 'user_email'
                  }
                },
                // Get URL making API calls and number of requests (doc_count)
                request_url: {
                  terms: {
                    field: 'request_path'
                  }
                }
              }
            },
          }
        },
      },
    },
  };

  // Get Elasticsearch data
  Meteor.call('getElasticsearchData', elasticsearchHost, queryParams, (error, result) => {

    if (error) {
      templateInstance.error.set(error);
      throw Meteor.Error(error)
    }
    // Update Elasticsearch data reactive variable with result
    templateInstance.elasticsearchData.set(result);
  });
});

Template.apiAnalyticsView.onRendered(function () {

});


