window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  console.log(event)
  var message = event.data;

  // Only accept messages that we know are ours. Note that this is not foolproof
  // and the page can easily spoof messages if it wants to.
  if (message !== 'update-macros') {
    return;
  }

  chrome.runtime.sendMessage(message);
});
