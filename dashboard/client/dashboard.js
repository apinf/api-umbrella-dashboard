import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating';

Template.dashboard.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;

  // Create reactive variable for Elasticsearch host
  templateInstance.elasticsearchHost = new ReactiveVar();

  // Handle changes to Elasticsearch host
  templateInstance.autorun(function () {
    // Get value of Elasticsearch host
    const host = templateInstance.elasticsearchHost.get();

    if (host) {
      Meteor.call('getElasticsearchData', host);
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
