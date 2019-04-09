var connections = {};

var sendData = function(data, d, c) {

    var url = "http://localhost:8080/upload?device="+d+"&connection="+c+"&url="+c;
    console.log(url)
    var method = "POST";
    console.log(data);
    var postData = JSON.stringify(data);
    var shouldBeAsync = true;
    var request = new XMLHttpRequest();
    request.onload = function () {
        var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
        var data = request.responseText; // Returned data, e.g., an HTML document.
    }
    request.open(method, url, shouldBeAsync);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(postData);
}

console.log("Hello this is background script");

chrome.runtime.onConnect.addListener(function (port) {

    var extensionListener = function (message, sender, sendResponse) {
        // The original connection event doesn't include the tab ID of the
        // DevTools page, so we need to send it explicitly.
        if (message.name == "init") {
          temp = port;
          connections[message.tabId] = port;
          console.log("Adding tab id to connection list"+message.tabId+" "+port)
          console.log(port);
          return;
        }
        else if(message.name == "hardata") {
           console.log("We have har data to send to cloud");
           console.log(message.payload);
           sendData(message.payload, message.device, message.connection)    
        }
        else {
        }
	// other message handling
    }
    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(extensionListener);

        var tabs = Object.keys(connections);
        for (var i=0, len=tabs.length; i < len; i++) {
          if (connections[tabs[i]] == port) {
            console.log("Removing port "+port)
            delete connections[tabs[i]]
            break;
          }
        }
    });
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (sender.tab) {
      var tabId = sender.tab.id;
      console.log(sender.tab.id);
      if (tabId in connections) {
      try {
        connections[tabId].postMessage(request);
        }
        catch(error) {
            console.error(error);
        }
        console.log("Sending message"+request+" to "+tabId+" "+connections[tabId])
        console.log(connections[tabId]);
      } else {
        console.log("Tab not found in connection list.");
      }
    } else {
      console.log("sender.tab not defined.");
    }
    return true;
});








