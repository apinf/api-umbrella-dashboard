/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

Template.mostFrequentUsersTable.helpers({
  users () {
    const buckets = Template.instance().data.buckets;

    const users = [];

    buckets.forEach(bucket => {
      bucket.request_url.buckets.forEach(req => {
        const user = {};
        // Get value of email
        user.email = bucket.user_email.buckets[0].key;
        user.calls = req.doc_count;
        user.url = req.key;

        users.push(user);
      });
    });

    return users;
  },
});
