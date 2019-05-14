window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    chrome.runtime.sendMessage("foo", function (response) {
    console.log(response);
    });
},false);



