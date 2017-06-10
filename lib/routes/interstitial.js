'use strict';

module.exports = function (app) {
  const basicChassisOptions = {
    chassis: {
      accountNavigation: false,
      navigation: true,
      footer: true,
      i18n: true,
      data: true
    },
    auth: 'none'
  },
  env = (process.env.GILT_ENV || 'production').toLowerCase(),
  req = app.utils.request,
  appHelpers = require('../util/appHelpers.js')(app, env),
  svcUserClient = require('@gilt-tech/node-client.svc-user')(app),
  svcSubscriptionClient = require('@gilt-tech/node-client.svc-subscription')(app);

  return {
    get: {
      // The alias prefix from the package.json is prepended to each route described here
      '/interstitial/:email_type/:login_key': {
        fn: function* address(next, locals) {
          const localizedStrings = this.i18n;
          let renderData;
          const emailType = this.params.email_type;
          const loginKey = this.params.login_key;
          let showFrequency = '';
          if (emailType === 'daily_sales_reminder') {
            showFrequency = 'weekly';
          } else if (emailType === 'weekly_sales_reminder') {
            showFrequency = 'daily';
          }

          locals.metaData = locals.metaData || {};
          //TODO: update localized string for interstitial
          locals.metaData.title = localizedStrings.web_account_email_preferences.value + ' / Gilt';
          renderData = {emailType: emailType, loginKey: loginKey, showFrequency: showFrequency };

          yield this.render('interstitial', renderData);
          yield next;
        },
        options: basicChassisOptions
      }
    },
    'post': {
      '/interstitial/:email_type/:login_key/stay': {
        fn: function*() {
          const emailType = this.params.email_type;
          const stay = true;

          yield this.render('success', {emailType: emailType, stay: stay});
        },
        options: basicChassisOptions
      },
      '/interstitial/:email_type/:login_key/unsub_email': {
        fn: function*() {
          const loginKey = this.params.id || this.params.login_key;
          const emailType = this.params.email_type;
          const getGuidByLoginKeyResponse = yield svcUserClient.getGuidByLoginKey({loginKey: loginKey});
          const unsubMailingListResponse = yield svcSubscriptionClient.unsubMailingList({userGuid: getGuidByLoginKeyResponse.response.data.guid, mailingList: emailType});

          if (unsubMailingListResponse.response.http.code === 200) {
            yield this.render('success', {emailType: emailType, noElseIfSupport: true});
          } else {
            yield this.render('error');
          }
        },
        options: basicChassisOptions
      },
      '/interstitial/:email_type/:login_key/unsubscribe_all': {
        fn: function*() {
          const loginKey = this.params.id || this.params.login_key;
          const emailType = this.params.email_type;
          const getGuidByLoginKeyResponse = yield svcUserClient.getGuidByLoginKey({loginKey: loginKey});
          const unsubAllResponse = yield svcSubscriptionClient.unsubAll({userGuid: getGuidByLoginKeyResponse.response.data.guid});

          if (unsubAllResponse.response.http.code === 200) {
            yield this.render('success', {emailType: emailType, unsubAllEmails: true});
          } else {
            yield this.render('error');
          }
        },
        options: basicChassisOptions
      },
      '/interstitial/:email_type/:login_key/frequency': {
        fn: function*() {
          const loginKey = this.params.id || this.params.login_key;
          const emailType = this.params.email_type;
          const getGuidByLoginKeyResponse = yield svcUserClient.getGuidByLoginKey({loginKey: loginKey});
          const userGuid = getGuidByLoginKeyResponse.response.data.guid;
          let emailToSubscribe;

          if (emailType === 'daily_sales_reminder') {
            emailToSubscribe = 'weekly_sales_reminder';
          } else {
            emailToSubscribe = 'daily_sales_reminder';
          }
          const unsubMailingListResponse = yield svcSubscriptionClient.unsubMailingList({userGuid: userGuid, mailingList: emailType});
          const changeFrequency =  yield svcSubscriptionClient.subscribeMailingList({userGuid: userGuid, mailingList: emailToSubscribe});

          if (unsubMailingListResponse.response.http.code === 200) {
            if (changeFrequency.response.http.code === 200) {
              yield this.render('success', {emailType: emailType, emailToSubscribe: emailToSubscribe});
            }
          } else {
            yield this.render('error');
          }
        },
        options: basicChassisOptions
      }
    }
  };
};
