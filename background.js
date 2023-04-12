chrome.runtime.onInstalled.addListener(function() {
  console.log("onInstalled");
  createContextMenu();

  // 当 tags 列表发生变化时，重新创建右键菜单
  chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === "local" && changes.tags) {
      createContextMenu();
    }
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "default") {
    saveToPool(info.selectionText, 'default');
  } else {
    saveToPool(info.selectionText, [info.menuItemId]);
  }
});

function createContextMenu() {
  chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
      id: "addToPool",
      title: "Add to Pool",
      contexts: ["selection"],
    }, function() {
      // 创建二级菜单
      chrome.storage.local.get({ tags: [] }, function(result) {
        console.log("更新tag选项");
        const tags = result.tags;
        const parentId = "addToPool";
        for (let tag of tags) {
          chrome.contextMenus.create({
            id: tag,
            title: tag,
            parentId: parentId,
            contexts: ["selection"],
          });
        }
        chrome.contextMenus.create({
          id: "default",
          title: "default",
          parentId: parentId,
          contexts: ["selection"],
        });
      });
    });
  });
}

function saveToPool(text, tags) {
  console.log('tags:'+tags);
if (!tags) {
  console.log('tags没有');
tags = "default";
}
chrome.storage.local.get({ pool: [] }, function(result) {
const pool = result.pool;
// Check if text is already in pool
const exists = pool.some(item => item.text === text);

if (exists) {
  // Text already exists in pool, show error notification
  showNotificationError("Text already exists in pool.");
} else {
  // Text doesn't exist in pool, save to pool and show success notification
  pool.push({ text: text, tags: tags });
  chrome.storage.local.set({ pool: pool }, function() {
    console.log("Saved to pool:", { text: text, tags: tags });
    showNotificationDone("Saved to pool."+ JSON.stringify({ text: text, tags: tags }));
  });
}
});
}

chrome.runtime.onMessage.addListener(

function(request, sender, sendResponse) {
  // sendResponse({status: true,"where":"out","can":request})
  if (request.type == "saveToPool") { 
    sendResponse({status: true,"where":"saveToPool"})
    var selectedText = request.text;
    console.log('selectedText:'+selectedText);
    saveToPool(selectedText, 'default');
  }

});

chrome.runtime.onMessage.addListener(

function(request, sender, sendResponse) {
  // sendResponse({status: true,"where":"out","can":request})
  if (request.type == "refreshTags") { 
    sendResponse({status: true,"where":"refreshTags"})
    createContextMenu();
  }

});

function showNotificationDone(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "done48.png",
    title: "Done.",
    message: message,
  }, function() {
    setTimeout(function() {
      chrome.notifications.clear("Done.", function() {});
    }, 1300);
  });
}

function showNotificationError(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "error48.png",
    title: "Oops...",
    message: message,
  }, function() {
    setTimeout(function() {
      chrome.notifications.clear("Oops...", function() {});
    }, 1300);
  });
}
