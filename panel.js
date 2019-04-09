chrome.devtools.panels.create("HarS3", "toast.png", "panel.html", function(panel) {});

var count = 1;
var message_har = null;

function HarDownloader() {};

HarDownloader.logger = function(message) {
    //console.log(message);
    backgroundPageConnection.postMessage({
    name: 'hardata',
    payload: message,
    device: document.getElementById("connection").value,
    connection: document.getElementById("device").value 
});
}

HarDownloader.log = function(data) {
    if(message_har!= null && 'pages' in data)
    {
      
      //console.log("condition satisfied");
      //console.log("Data HAR"+data.pages[0].startedDateTime);
      //console.log("Message HAR"+message_har.pages[0].startedDateTime);
      if(data.pages[0].startedDateTime != message_har.pages[0].startedDateTime) {
           console.log("Now posting the message to cloud");
           HarDownloader.logger(message_har);  
      }
    }
    message_har=data;
}

chrome.devtools.network.onRequestFinished.addListener(
          function(request) {
          chrome.devtools.network.getHAR(HarDownloader.log);
});

console.log("Logging in panel");

var backgroundPageConnection = chrome.runtime.connect({
    name: "HarPanel"
});

backgroundPageConnection.onMessage.addListener(function (message, sender, sendResponse) {
    // Handle responses from the background page, if any
    //console.log("Received message in devtools");
    console.log(message);
    chrome.devtools.network.getHAR(HarDownloader.logger);
    return true;
});


backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

backgroundPageConnection.onDisconnect.addListener(function(port) {
        console.log("Disconnected devtools");
    });

chrome.runtime.sendMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "content.js"
});


