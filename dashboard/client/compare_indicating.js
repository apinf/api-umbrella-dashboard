/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

export function arrowDirection (parameter, bucket) {
  let style;

  switch (parameter) {
    case 'requests': {
      style = bucket.compareRequests === 0 ? undefined :
        bucket.compareRequests > 0 ? 'arrow-up' : 'arrow-down';
    }
      break;
    case 'response': {
      style = bucket.compareResponse === 0 ? undefined :
        bucket.compareResponse > 0 ? 'arrow-up_time' : 'arrow-down_time';
    }
      break;
    case 'users': {
      style = bucket.compareUsers === 0 ? undefined :
        bucket.compareUsers > 0 ? 'arrow-up' : 'arrow-down';
    }
  }

  // if style is undefined that don't display an arrow indicating
  return style;
}

export function percentageValue (parameter, bucket) {
  let percentage;

  switch (parameter) {
    case 'requests': {
      percentage = Math.abs(bucket.compareRequests);
    }
      break;
    case 'response': {
      percentage = Math.abs(bucket.compareResponse);
    }
      break;
    case 'users': {
      percentage = Math.abs(bucket.compareUsers);
    }
  }

  // don't display 0%
  return percentage > 0 ? percentage + '%' : '';
}

export function calculateTrend (prev, curr) {
  // If values are equal
  // then no up-down
  if (prev === curr) return 0;

  // it is impossible to divide on 0
  // If previous value is 0 then progress is up on 100%
  if (prev === 0 || isNaN(prev)) return 100;

  // If current value is 0 then progress is down on 100%
  if (curr === 0 || isNaN(curr)) return -100;

  return Math.round((curr / prev - 1) * 100);
}

export function summaryComparing (parameter, bucket) {
  const direction = arrowDirection(parameter, bucket);
  const percentages = percentageValue(parameter, bucket);
  let trend;

  if (direction && percentages) {
    if (direction === 'arrow-up' || direction === 'arrow-down_time') {
      trend = 'higher';
    } else {
      trend = 'lower';
    }

    return `${percentages} ${trend} than last 7 days`;
  }

  return '';
}
