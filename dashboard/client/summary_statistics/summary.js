import _ from 'lodash';

Template.summaryStatistic.helpers({
  callsNumber () {
    const elasticsearchData = Template.currentData().elasticsearchData;

    // Make sure data exists or set an empty array on default
    const value = _.get(elasticsearchData, 'hits.hits', []);

    // Size of array is total number of calls
    return value.length;
  },
  responseTime () {
    const elasticsearchData = Template.currentData().elasticsearchData;

    // Get number of average response time or 0 is default value
    const value = _.get(elasticsearchData, 'aggregations.total_avg_response_time.value', 0);

    return parseInt(value, 10);
  },
  uniqueUsers () {
    // Get
    const elasticsearchData = Template.currentData().elasticsearchData;

    // Placeholder
    let uniqUserIds = [];

    // Make sure result has data
    if (_.has(elasticsearchData, 'hits.hits')) {
      // Calculate list with unique users items
      uniqUserIds = _.uniqBy(elasticsearchData.hits.hits, 'fields.user_id[0]')
    }

    // Get number of unique users
    return uniqUserIds.length;
  },
});
