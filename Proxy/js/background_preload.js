(function() {
  window.UglifyJS_NoUnsafeEval = true;

  localStorage['log'] = '';

  localStorage['logLastError'] = '';

  window.OmegaContextMenuQuickSwitchHandler = function() {
    return null;
  };

  if (chrome.i18n.getUILanguage != null) {
    chrome.contextMenus.create({
      id: 'enableQuickSwitch',
      title: chrome.i18n.getMessage('contextMenu_enableQuickSwitch'),
      type: 'checkbox',
      checked: false,
      contexts: ["browser_action"],
      onclick: function(info) {
        return window.OmegaContextMenuQuickSwitchHandler(info);
      }
    });
  }

  chrome.contextMenus.create({
    title: chrome.i18n.getMessage('popup_reportIssues'),
    contexts: ["browser_action"],
    onclick: function() {
      var body, env, err, extensionVersion, finalUrl, url;
      url = 'https://github.com/FelisCatus/SwitchyOmega/issues/new?title=&body=';
      finalUrl = url;
      try {
        extensionVersion = chrome.runtime.getManifest().version;
        env = {
          extensionVersion: extensionVersion,
          projectVersion: extensionVersion,
          userAgent: navigator.userAgent
        };
        body = chrome.i18n.getMessage('popup_issueTemplate', [env.projectVersion, env.userAgent]);
        body || (body = "\n\n\n<!-- Please write your comment ABOVE this line. -->\nSwitchyOmega " + env.projectVersion + "\n" + env.userAgent);
        finalUrl = url + encodeURIComponent(body);
        err = localStorage['logLastError'];
        if (err) {
          body += "\n```\n" + err + "\n```";
          finalUrl = (url + encodeURIComponent(body)).substr(0, 2000);
        }
      } catch (_error) {}
      return chrome.tabs.create({
        url: finalUrl
      });
    }
  });

  chrome.contextMenus.create({
    title: chrome.i18n.getMessage('popup_errorLog'),
    contexts: ["browser_action"],
    onclick: function() {
      var blob;
      blob = new Blob([localStorage['log']], {
        type: "text/plain;charset=utf-8"
      });
      return saveAs(blob, "OmegaLog_" + (Date.now()) + ".txt");
    }
  });

}).call(this);
