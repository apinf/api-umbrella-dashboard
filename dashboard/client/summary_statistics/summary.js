Template.summaryStatistic.onCreated( function () {
  this.calcComparing = (prev, curr) => {
    // If values are equeled then no up-down
    if (prev === curr) return 0;

    // it is impossible to divide on 0
    // If previous value is 0 then progress is up on 100%
    if (prev === 0) return 100;

    // If current value is 0 then progress is down on 100%
    if (curr === 0) return -100;

    return Math.round((curr / prev - 1) * 100);
  }
});

Template.summaryStatistic.helpers({
  buckets () {
    const templateInstance = Template.instance();
    // Get ES data
    const elasticsearchData = Template.currentData().elasticsearchData;

    // Get bucket of aggregated data
    const buckets = elasticsearchData.aggregations.group_by_request_path.buckets;

    return buckets.map(value => {
      const currentPeriodBucket = value.group_by_interval.buckets['currentWeek'];
      const previousPeriodBucket = value.group_by_interval.buckets['previousWeek'];

      // Get the statistic for current period
      const requestNumber = currentPeriodBucket.doc_count;
      const responseTime = parseInt(currentPeriodBucket.response_time.values['95.0'], 10);
      const uniqueUsers = currentPeriodBucket.unique_users.buckets.length;

      // Get the statistics comparing between previous and current periods
      const compareRequests = templateInstance.calcComparing(previousPeriodBucket.doc_count, requestNumber);
      const compareResponse = templateInstance.calcComparing(
        parseInt(previousPeriodBucket.response_time.values['95.0'], 10), responseTime
      );
      const compareUsers = templateInstance.calcComparing(
        previousPeriodBucket.unique_users.buckets.length, uniqueUsers
      );

      // Get value to display
      const response = {
        // TODO: Instead of attr create an unique ID. It needs to create an unique selector for SVG chart
        attr: value.key,
        requestPath: value.key,
        requestNumber,
        responseTime,
        uniqueUsers,
        requestOverTime: currentPeriodBucket.requests_over_time,
        averageResponseTime: currentPeriodBucket.requests_over_time,
        compareRequests,
        compareResponse,
        compareUsers,
      };

      return response
    });
  },
  arrowDirection (parameter) {
    let style;

    switch(parameter) {
      case 'requests': {
        style = this.compareRequests === 0 ? undefined :
          this.compareRequests > 0 ? 'arrow-up' : 'arrow-down';
      }
      break;
      case 'response': {
        // decrease: green & increase: red for response_time
        style = this.compareResponse === 0 ? undefined :
          this.compareResponse < 0 ? 'arrow-up' : 'arrow-down';
      }
      break;
      case 'users': {
        style = this.compareUsers === 0 ? undefined :
          this.compareUsers > 0 ? 'arrow-up' : 'arrow-down';
      }
    }

    // if style is undefined that don't display an arrow indicating
    return style;
  },
  percentages (parameter) {
    let percentage;

    switch(parameter) {
      case 'requests': {
        percentage = Math.abs(this.compareRequests)
      }
        break;
      case 'response': {
        percentage = Math.abs(this.compareResponse)

      }
        break;
      case 'users': {
        percentage = Math.abs(this.compareUsers)
      }
    }

    // don't display 0%
    return percentage > 0 ? percentage + '%' : '';
  }
});
