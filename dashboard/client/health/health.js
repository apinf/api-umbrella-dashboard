Template.elasticsearchHealth.onCreated(function () {
  // Get reference to template instance
  const templateInstance = this;

  // Create reactive variable for Elasticsearch health
  templateInstance.elasticsearchHealth = new ReactiveVar();

  templateInstance.autorun(function () {
    const elasticsearchHost = Template.currentData().elasticsearchHost;

    if (elasticsearchHost) {
      Meteor.call('getElasticsearchHealth', elasticsearchHost, function (error, health) {
        if (error) {
          throw new Meteor.Error(error);
        } else {
          // update Elasticsearch health reactive variable
          templateInstance.elasticsearchHealth.set(health);
        }
      });
    }
  });
});

Template.elasticsearchHealth.helpers({
  health () {
    // Get reference to template instance
    const templateInstance = Template.instance();

    return templateInstance.elasticsearchHealth.get();
  }
});
