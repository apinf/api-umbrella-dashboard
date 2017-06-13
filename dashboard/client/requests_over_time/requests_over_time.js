Template.requestsOverTime.onRendered(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  templateInstance.autorun(function () {
    const elasticsearchHost = Template.currentData().elasticsearchHost;

    console.log(elasticsearchHost);
  });
});
