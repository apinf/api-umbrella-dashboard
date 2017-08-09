import { arrowDirection, percentageValue, summaryComparing } from '../compare_indicating';

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
    return summaryComparing(parameter, this)
  }
});
