export function arrowDirection (parameter, bucket) {
  let style;

  switch(parameter) {
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

  switch(parameter) {
    case 'requests': {
      percentage = Math.abs(bucket.compareRequests)
    }
      break;
    case 'response': {
      percentage = Math.abs(bucket.compareResponse)

    }
      break;
    case 'users': {
      percentage = Math.abs(bucket.compareUsers)
    }
  }

  // don't display 0%
  return percentage > 0 ? percentage + '%' : '';
}
