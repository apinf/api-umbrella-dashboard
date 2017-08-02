import { arrowDirection, percentageValue } from '../compare_indicating';

Template.dashboardOverviewStatistic.helpers({
  arrowDirection (parameter) {
    // Provide compared data
    return arrowDirection(parameter, this);
  },
  percentages (parameter) {
    // Provide compared data
    return percentageValue(parameter, this);
  },
  overviewComparing (parameter) {
    const direction = arrowDirection(parameter, this);
    const percentages = percentageValue(parameter, this);
    let trend;

    if (direction && percentages) {
      if (direction === 'arrow-up' || direction === 'arrow-down_time') {
        trend = 'higher';
      } else {
        trend = 'lower';
      }

      return `${percentages} ${trend} than last 7 days`
    }

    return '';
  }
});
