Template.elasticsearchHealth.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;

  // Create reactive variable for Elasticsearch health
  templateInstance.elasticsearchHealth = new ReactiveVar();

  templateInstance.autorun(function () {
    const host = Template.currentData().host;

    Meteor.call('getElasticsearchHealth', host, function (error, health) {
      if (error) {
        throw new Meteor.Error(error);
      } else {
        // update Elasticsearch health reactive variable
        templateInstance.elasticsearchHealth.set(health);
      }
    });
  });
});

Template.elasticsearchHealth.helpers({
  health () {
    // Get reference to template instance
    const templateInstance = Template.instance();

    return templateInstance.elasticsearchHealth.get();
  }
});
