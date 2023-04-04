chrome.runtime.onInstalled.addListener(function() {
  console.log("onInstalled");
  chrome.contextMenus.create({
    id: "addToPool",
    title: "Add to Pool",
    contexts: ["selection"],
  });
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {          
  if (changeInfo.status == 'complete') { 
    chrome.contextMenus.onClicked.addListener(function(info, tab) {
      if (info.menuItemId == "addToPool") {
        var selectedText = info.selectionText;
        saveToPool(selectedText, function() {
          showNotification("Text saved to pool: " + selectedText);
        });
      }
    });
  }
});


function saveToPool(text, callback) {
  chrome.storage.local.get({ pool: [] }, function(result) {
    console.log("普通saveToPool");
    var pool = result.pool;
    pool.push(text);
    chrome.storage.local.set({ pool: pool }, function() {
      if (typeof callback === "function") {
        callback();
      }
    });
  });
}

// chrome.runtime.onMessage.addListener(
// function saveToPool(text, callback) {
//   console.log(text);
//   chrome.storage.local.get({ pool: [] }, function(result) {
//     console.log("监听saveToPool");
//     var pool = result.pool;
//     pool.push(text);
//     chrome.storage.local.set({ pool: pool }, function() {
//       if (typeof callback === "function") {
//         callback();
//       }
//     });
//   });
// }
// );
chrome.runtime.onMessage.addListener(

function(request, sender, sendResponse) {
  // sendResponse({status: true,"where":"out","can":request})
  if (request.type == "saveToPool") { 
    sendResponse({status: true,"where":"in"})
    var selectedText = request.text;
    saveToPool(selectedText, function() {
      showNotification("Text saved to pool: " + selectedText);
      // sendResponse({status: true,"where":"showNotification"})
    });
  }     
});

function showNotification(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "ppicon32.png",
    title: "PromptPool",
    message: message,
  }, function() {
    setTimeout(function() {
      chrome.notifications.clear("PromptPool", function() {});
    }, 2000);
  });
}
