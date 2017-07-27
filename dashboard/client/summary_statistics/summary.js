Template.summaryStatistic.helpers({
  buckets () {
    // Get ES data
    const elasticsearchData = Template.currentData().elasticsearchData;

    // Get bucket of aggregated data
    const buckets = elasticsearchData.aggregations.group_by_request_path.buckets;

    return buckets.map(value => {
      // Get data for current period.
      const currentPeriodBucket = value.group_by_interval.buckets['currentWeek'];

      return {
        // TODO: Instead of attr create an unique ID. It needs to create an unique selector for SVG chart
        attr: value.key,
        requestPath: value.key,
        requestNumber: currentPeriodBucket.doc_count,
        responseTime: parseInt(currentPeriodBucket.response_time.values['95.0'], 10),
        uniqueUsers: currentPeriodBucket.unique_users.buckets.length,
        requestOverTime: currentPeriodBucket.requests_over_time,
        averageResponseTime: currentPeriodBucket.requests_over_time,
      }
    });
  },
});
