// Create a queue, but don't obliterate an existing one!
var analytics = analytics || [];

// Define a method that will asynchronously load analytics.js from our CDN.
analytics.load = function(apiKey) {
  loadScript(('https:' === document.location.protocol ? 'https://' : 'http://') +
              'd2dq2ahtl5zl1z.cloudfront.net/analytics.js/v1/' + apiKey + '/analytics.min.js');

  // Define a factory that generates wrapper methods to push arrays of
  // arguments onto our `analytics` queue, where the first element of the arrays
  // is always the name of the analytics.js method itself (eg. `track`).
  var methodFactory = function (type) {
    return function () {
      analytics.push([type].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };

  // Loop through analytics.js' methods and generate a wrapper method for each.
  var methods = ['identify', 'track', 'trackLink', 'trackForm', 'trackClick',
                 'trackSubmit', 'pageview', 'ab', 'alias'];
  for (var i = 0; i < methods.length; i++) {
    analytics[methods[i]] = methodFactory(methods[i]);
  }

  setupTracking();
};

// Load analytics.js with your API key, which will automatically load all of the
// analytics integrations you've turned on for your account. Boosh!
analytics.load('ru0h6g04hek');

// Firebase specific tracking.
function setupTracking() {
  window.onAuth = window.onAuth || [];
  window.onAuth.push(function(account) {
    if (!account) {
      return;
    }
    var traits = {email: account.email};
    if (account.name) {
      traits.name = account.name;
    }
    if (account.date) {
      // Analytics.js does the conversion for us.
      traits.created = account.date;
    }
    if (account.namespaces) {
      var count = 0;
      for (n in account.namespaces) {
        if (account.namespaces.hasOwnProperty(n)) {
          count++;
        }
      }
      traits.namespaces = count;
    }
    traits.unsubscribed = false;
    if (account.notifications) {
      if (account.notifications.firebase_announcements === false) {
        traits.unsubscribed = true;
      }
    }
    analytics.identify(account.id, traits);

    // Page based actions.
    var props = {};
    var time = Math.round(new Date().getTime()/1000);
    if (document.title.indexOf("Forge") >= 0) {
      analytics.track("forge_visit", {at: time});
    }
    if (document.location.toString().indexOf("tutorial") >= 0) {
      if (document.location.hash.indexOf("gettingstarted") >= 0) {
        analytics.track("tutorial", {at: time, progress: "start"});
      }
      TutorialRouter.on("route", function(router, route, params) {
        analytics.track("tutorial", {
          at: Math.round(new Date().getTime()/1000),
          progress: route[0] + route[1]
        });
      });
    }

    // Attach trackClick events to all links with the appropriate data attributes.
    !function($) {
      "use strict";
      var attr = '[data-toggle=trackClick]';
      $('[data-toggle=trackLink]').each(function(index, el) {
        var $this = $(this),
            eventStr = $this.data('event');
        analytics.trackLink(el, eventStr);
      });
    }(window.jQuery);
  });
}

// Load a script asynchronously.
function loadScript(src) {
  // Create an async script element for analytics.js.
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = src;

  // Find the first script element on the page and insert our script next to it.
  var firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
}

// Qualaroo.
var _kiq = _kiq || [];
loadScript(('https:' === document.location.protocol ? 'https://' : 'http://') +
            's3.amazonaws.com/ki.js/42830/8hz.js');
