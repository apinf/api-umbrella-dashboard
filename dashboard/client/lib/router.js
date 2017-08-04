FlowRouter.route('/', {
  name: 'dashboard',
  action () {
    BlazeLayout.render('masterLayout', { main: 'dashboard' });
  }
});

FlowRouter.route('/api-page/:id', {
  name: 'apiAnalyticsPage',
  action () {
    BlazeLayout.render('masterLayout', { main: 'apiAnalyticsView' });
  }
});
