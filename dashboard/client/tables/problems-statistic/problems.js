import moment from 'moment';

import Chart from 'chart.js';


Template.problemsTable.helpers({
  errors () {
    const buckets = Template.instance().data.buckets;

    const errors = [];

    buckets.forEach(bucket => {
      const requestPath = bucket.key;

      bucket.errors_statistic.errors_over_time.buckets.forEach(date => {
        const error = {
          path: requestPath,
          date: moment(date.key)
        };

        date.status.buckets.forEach(status => {
          const error = {
            path: requestPath,
            date: moment(date.key),
            status: status.key,
            calls: status.doc_count
          };

          errors.push(error)
        });
      });
    });

    return errors
  }
});
