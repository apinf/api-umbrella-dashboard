import { arrowDirection, percentageValue, calculateTrend } from '../compare_indicating';

Template.dashboardSummaryStatistic.onCreated(function () {
  this.displayOverview = new ReactiveDict();
});

Template.dashboardSummaryStatistic.helpers({
  buckets () {
    // Get ES data
    const elasticsearchData = Template.currentData().elasticsearchData;

    // Get bucket of aggregated data
    const buckets = elasticsearchData.aggregations.group_by_request_path.buckets;

    return buckets.map(value => {
      const currentPeriodBucket = value.group_by_interval.buckets['currentWeek'];
      const previousPeriodBucket = value.group_by_interval.buckets['previousWeek'];

      // Get the statistic for current period
      const requestNumber = currentPeriodBucket.doc_count;
      const responseTime = parseInt(currentPeriodBucket.response_time.values['95.0'], 10) || 0;
      const uniqueUsers = currentPeriodBucket.unique_users.buckets.length;
      const successCallsCount = currentPeriodBucket.success_status.buckets['success'].doc_count;
      const errorCallsCount = currentPeriodBucket.success_status.buckets['error'].doc_count;

      // Get the statistics comparing between previous and current periods
      const compareRequests = calculateTrend(previousPeriodBucket.doc_count, requestNumber);
      const compareResponse = calculateTrend(
        parseInt(previousPeriodBucket.response_time.values['95.0'], 10), responseTime
      );
      const compareUsers = calculateTrend(
        previousPeriodBucket.unique_users.buckets.length, uniqueUsers
      );

      Template.instance().displayOverview.set(value.key, false);
      // Get value to display
      const response = {
        // TODO: Instead of attr create an unique ID. It needs to create an unique selector for SVG chart
        attr: value.key,
        requestPath: value.key,
        requestNumber,
        responseTime,
        uniqueUsers,
        successCallsCount,
        errorCallsCount,
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
  },
  displayOverview (parameter) {
    return Template.instance().displayOverview.get(parameter);
  }
});

Template.dashboardSummaryStatistic.events({
  'click [data-id]': (event, templateInstance) => {
    const target = event.currentTarget;

    const display =  templateInstance.displayOverview.get(target.dataset.id);

    templateInstance.displayOverview.set(target.dataset.id, !display);

    // Draw the box-shadow
    target.classList.toggle('open');
  },
});
