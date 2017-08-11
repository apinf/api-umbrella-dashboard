/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

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
          date: moment(date.key),
        };

        date.status.buckets.forEach(status => {
          const error = {
            path: requestPath,
            // TODO: make localisation depends on a selected lang
            date: new Date(date.key).toLocaleString('fi'),
            status: status.key,
            calls: status.doc_count,
          };

          errors.push(error);
        });
      });
    });

    return errors;
  },
});
