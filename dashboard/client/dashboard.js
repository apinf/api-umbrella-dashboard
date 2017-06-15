import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating';

Template.dashboard.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;

  // Create reactive variable for Elasticsearch host & data
  templateInstance.elasticsearchHost = new ReactiveVar();
  templateInstance.elasticsearchData = new ReactiveVar();

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
                      value: '/test-visionapi*',
                    },
                  },
                },
              ],
            },
          },
        },
      },
      aggs: {
        // Create data range with interval
        requests_over_time: {
          date_histogram: {
            field: 'request_at',
            interval: 'month',
          },
          aggs: {
            // Get average value of response time for each range
            avg_response_time: {
              avg: {
                field: 'response_time'
              }
            }
          }
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
