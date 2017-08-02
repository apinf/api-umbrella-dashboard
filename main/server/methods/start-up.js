Meteor.startup(function () {
  Meteor.call('generateProxy');
  Meteor.call('generateProxyBackend');
});

Meteor.methods({
  generateProxy () {
    const proxy = Proxy.find().fetch();

    if (proxy.length === 0) {
      Proxy.insert({
        name: 'Nightly API-Umbrella proxy',
        type: 'apiUmbrella',
        url: 'http://nightly.apinf.io:14002'
      });

      Proxy.insert({
        name: 'Second API-Umbrella proxy',
        type: 'apiUmbrella',
        url: 'http://nightly.apinf.io:3006'
      });

      Proxy.insert({
        name: 'MQTT Broker',
        type: 'emq'
      });
    }
  },
  generateProxyBackend () {
    const proxyBackend = ProxyBackend.find().fetch();

    if (proxyBackend.length === 0) {
      const proxies = Proxy.find().fetch();

      ProxyBackend.insert({
        proxyId: proxies[0]._id,
        'frontend_prefix': '/api-umbrella/v1/',
        apiName: 'Admin analytics'
      });

      ProxyBackend.insert({
        proxyId: proxies[0]._id,
        'frontend_prefix': '/gaagol/',
        apiName: 'Google'
      });

      ProxyBackend.insert({
        proxyId: proxies[1]._id,
        'frontend_prefix': '/analytics-test/',
        apiName: 'Analytics'
      });

      ProxyBackend.insert({
        proxyId: proxies[1]._id,
        'frontend_prefix': '/postman-echo/',
        apiName: 'Postman Echo'
      });
    }
  }
});
