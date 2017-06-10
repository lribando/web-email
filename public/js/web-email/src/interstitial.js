'use strict';

import $ from '../vendor/jquery/jquery';
import pageController from '../common/page_controller/page_controller';

function init() {
  const error = pageController.getProperty('error');
  const $formEmailPrefAction = $('form[name=email-preferences]');

  $('.button-large-primary').click(function() {
    const selected = $('input:radio[name=sub-selection]:checked').val();
    $formEmailPrefAction.attr('action', $formEmailPrefAction.attr('action') + selected);
  });

  if (error) {
    setTimeout(function() {
      window.location.href = 'https://www.gilt.com/web-account/email';
    }, 3000);
  }
}

export default {
  version: '$$PACKAGE_VERSION$$',
  init: init
};
