import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating';

Template.dashboard.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;

  // Create reactive variable for Elasticsearch host
  templateInstance.elasticsearchHost = new ReactiveVar();

  // Create reactive variable for Elasticsearch data
  templateInstance.elasticsearchData = new ReactiveVar();

  // Handle changes to Elasticsearch host
  templateInstance.autorun(function () {
    // Get value of Elasticsearch host
    const host = templateInstance.elasticsearchHost.get();

    if (host) {
      Meteor.call('getElasticsearchData', host, function (error, result) {
        if (error) {
          throw Meteor.Error('error', error)
        } else {
          // Update Elasticsearch data reactive variable
          templateInstance.elasticsearchData.set(result);
        }
      });
    }
  });
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

Template.dashboard.helpers({
  host () {
    // Get reference to template instance
    const templateInstance = Template.instance();

    // Return value of Elasticsearch host
    return templateInstance.elasticsearchHost.get();
  }
});
