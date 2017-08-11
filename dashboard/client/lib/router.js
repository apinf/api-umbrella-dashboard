/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

FlowRouter.route('/', {
  name: 'dashboard',
  action () {
    BlazeLayout.render('masterLayout', { main: 'dashboard' });
  },
});

FlowRouter.route('/api-page/:id', {
  name: 'apiAnalyticsPage',
  action () {
    BlazeLayout.render('masterLayout', { main: 'apiAnalyticsView' });
  },
});
