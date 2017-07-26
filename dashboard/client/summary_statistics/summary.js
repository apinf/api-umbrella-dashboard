Template.summaryStatistic.helpers({
  buckets () {
    // Get ES data
    const elasticsearchData = Template.currentData().elasticsearchData;

    // Get bucket of aggregated data
    const buckets = elasticsearchData.aggregations.group_by_request_path.buckets;

    return buckets.map(value => {
      return {
        // TODO: Instead of attr create an unique ID. It needs to create an unique selector for SVG chart
        attr: value.key,
        requestPath: value.key,
        requestNumber: value.doc_count,
        responseTime: parseInt(value.response_time.values['95.0'], 10),
        uniqueUsers: value.unique_users.buckets.length,
        requestOverTime: value.requests_over_time,
        averageResponseTime: value.requests_over_time,
      }
    });
  },
});
