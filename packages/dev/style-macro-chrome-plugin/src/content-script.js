
if (window.__macrosLoaded) {
  return;
}
window.__macrosLoaded = true;

window.addEventListener('message', function (event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;

  // Only accept messages that we know are ours. Note that this is not foolproof
  // and the page can easily spoof messages if it wants to.
  if (message !== 'update-macros') {
    return;
  }
  // if this script is run multiple times on the page, then only handle it once
  event.stopImmediatePropagation();
  event.stopPropagation();

  chrome.runtime.sendMessage(message);
});
