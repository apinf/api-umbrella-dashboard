import { arrowDirection, percentageValue } from '../compare_indicating';

Template.dashboardSummaryStatistic.onCreated( function () {
  this.calculateTrend = (prev, curr) => {
    // If values are equal
    // then no up-down
    if (prev === curr) return 0;

    // it is impossible to divide on 0
    // If previous value is 0 then progress is up on 100%
    if (prev === 0) return 100;

    // If current value is 0 then progress is down on 100%
    if (curr === 0) return -100;

    return Math.round((curr / prev - 1) * 100);
  }
});

Template.dashboardSummaryStatistic.helpers({
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
      const successCallsCount = currentPeriodBucket.success_status.buckets['success'].doc_count;

      // Get the statistics comparing between previous and current periods
      const compareRequests = templateInstance.calculateTrend(previousPeriodBucket.doc_count, requestNumber);
      const compareResponse = templateInstance.calculateTrend(
        parseInt(previousPeriodBucket.response_time.values['95.0'], 10), responseTime
      );
      const compareUsers = templateInstance.calculateTrend(
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
        successCallsCount,
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
    // Provide compared data
    return arrowDirection(parameter, this);
  },
  percentages (parameter) {
    // Provide compared data
    return percentageValue(parameter, this);
  },
  textColor (parameter) {
    let textColor;
    const direction = arrowDirection(parameter, this);

    // Green color for text -  percentage value near arrow
    if (direction === 'arrow-up' || direction === 'arrow-down_time') {
      textColor =  'text-success';
    }

    // Red color for text - percentage value near arrow
    if (direction === 'arrow-down' || direction === 'arrow-up_time') {
      textColor = 'text-danger';
    }

    return textColor;
  }
});

Template.dashboardSummaryStatistic.events({
  'click [data-id]': (event) => {
    const target = event.currentTarget;

    // Draw the box-shadow
    target.classList.toggle('open');
    // Display a template with the related overview data
    target.nextElementSibling.classList.toggle('hidden');
  },
});
