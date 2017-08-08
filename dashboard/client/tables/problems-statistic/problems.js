Template.problemsTable.helpers({
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

    return users
  }
});
