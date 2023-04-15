// 引入CryptoJS库
importScripts('lib/md5.js');

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
        console.log("Refresh Tags");
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
  console.log('Tags ready?'+tags);
  if (!tags) {
    console.log('No Tags');
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
        showNotificationDone("Saved: "+ JSON.stringify(text) + ' (' + JSON.stringify( tags ) + ')');
        translate(text);
      });
    }
  });
}

function translate(text) {
  var appid = '20230407001632617';
  var key = 'farhYMhSxKG05lOEs9cA';
  var salt = (new Date).getTime();
  var from = 'en';
  var to = 'zh';
  var str1 = appid + text + salt + key;
  var sign = MD5(str1);

  var url = 'http://api.fanyi.baidu.com/api/trans/vip/translate?q=' + text + '&from=' + from + '&to=' + to + '&appid=' + appid + '&salt=' + salt + '&sign=' + sign;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      console.log(data);
      if (data.trans_result) {
        const translatedText = data.trans_result[0].dst;
        updatePool(text, translatedText);
      }
    })
    .catch(error => {
      console.error('Error handling response:', error);
    });
}



function updatePool(originalText, translatedText) {
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    pool.forEach(function (item, index) {
      if (item.text === originalText) {
        item.msg = translatedText;
        item.img = '';
      }
    });
    chrome.storage.local.set({ pool: pool }, function() {
      console.log("Updated pool:", pool);
    });
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
