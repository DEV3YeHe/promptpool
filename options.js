const exportButton = document.getElementById("export-button");
const importButton = document.getElementById("import-button");
const saveTagButton = document.getElementById("save-tag-button");
const tagInput = document.getElementById("tag-input");
const tagResult = document.getElementById("tag-result");
const tagList = document.getElementById("tag-list");

exportButton.addEventListener("click", exportPool);
importButton.addEventListener("click", importPool);
saveTagButton.addEventListener("click", saveTag);

const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.dataset.tab;
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      if (content.dataset.tab === tabId) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
  });
});

function showPool() {
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    const poolList = document.getElementById('pool-list');
    poolList.innerHTML = '';
    pool.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item.text;
      poolList.appendChild(listItem);
    });
  });
}

// 在页面加载后调用showPool函数，展示pool中的内容
document.addEventListener('DOMContentLoaded', showPool);



function exportPool() {
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    const textToSave = JSON.stringify(pool);

    const blob = new Blob([textToSave], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const filename = "PromptPool.json";
    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = url;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    const message = document.createElement("span");
    message.innerText = "Saved successfully";
    message.className = "success-message";
    document.body.appendChild(message);

    setTimeout(function() {
      document.body.removeChild(message);
    }, 1500);
  });
}



function importPool() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.addEventListener("change", function() {
    const file = input.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
      const text = reader.result;
      const items = JSON.parse(text);
      chrome.storage.local.get({ pool: [] }, function(result) {
        const existingPool = result.pool;
        const newItems = items.filter(item => !existingPool.some(existingItem => existingItem.text === item.text)); // 过滤掉已存在的文案
        const newPool = [...existingPool, ...newItems];
        chrome.storage.local.set({ pool: newPool }, function() {
          const successMessage = document.createElement("span");
          successMessage.innerText = `Imported ${newItems.length} items successfully.`; // 更新成功导入的文案数量
          successMessage.className = "success-message";
          document.body.appendChild(successMessage);
          setTimeout(function() {
            document.body.removeChild(successMessage);
            collectTags();
          }, 1500);

          chrome.storage.local.get({ pool: [] }, function(result) {
            const pool = result.pool;
            countAll.innerText = `Total: ${pool.length}`;
          });
        });
      });
    };

  });
  input.click();

}


tagInput.addEventListener("input", function() {
  if (tagInput.value.trim() !== "") {
    saveTagButton.disabled = false;
  } else {
    saveTagButton.disabled = true;
  }
});

function collectTags() {
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    let tags = [];
    for (let item of pool) {
      if (item.tags && item.tags.length > 0) {
        tags = tags.concat(item.tags);
      }
    }
    chrome.storage.local.get({ tags: [] }, function(result) {
      const existingTags = result.tags;
      tags = tags.filter(tag => !existingTags.includes(tag));
      const newTags = [...existingTags, ...tags];
      chrome.storage.local.set({ tags: newTags }, function() {
        tagResult.innerText = `Collected ${tags.length} tags successfully`;
        setTimeout(function() {
          tagResult.innerText = "";
        }, 1500);
        showTags();
      });
    });
  });
}

const collectTagsButton = document.getElementById("collectTagsButton");
collectTagsButton.addEventListener("click", collectTags);


function saveTag() {
  const tag = tagInput.value.trim();
  chrome.storage.local.get({ tags: [] }, function(result) {
    const tags = result.tags;
    if (tags.includes(tag)) {
      tagResult.innerText = "Tag already exists";
      setTimeout(function() {
        tagResult.innerText = "";
      }, 1500);
    } else {
      tags.push(tag);
      chrome.storage.local.set({ tags: tags }, function() {
        tagResult.innerText = "Tag saved successfully";
        tagInput.value = "";
        saveTagButton.disabled = true;
        setTimeout(function() {
          tagResult.innerText = "";
        }, 1500);
        
        showTags(); // 添加Tag成功后更新Tag列表
      });
    }
  });
}

function showTags() {
      chrome.storage.local.get({ tags: [] }, function(result) {
        const tags = result.tags;
        let html = "";
        for (let tag of tags) {
          html += `
            <div class="tag-list-item">
              <div>${tag}</div>
              <button class="delete-button" data-tag="${tag}">x</button>
            </div>
          `;
        }
        tagList.innerHTML = html;
        bindDeleteButtonListeners();
        chrome.runtime.sendMessage({ type: "refreshTags" }, function(response) {
          console.log(JSON.stringify(response) + "<刷新tags");
        });
      });
    }

    function bindDeleteButtonListeners() {
      const deleteButtons = document.querySelectorAll(".delete-button");
      deleteButtons.forEach(button => {
        button.addEventListener("click", function() {
          const tag = button.dataset.tag;
          chrome.storage.local.get({ tags: [] }, function(result) {
            const tags = result.tags;
            const index = tags.indexOf(tag);
            if (index !== -1) {
              tags.splice(index, 1);
              chrome.storage.local.set({ tags: tags }, function() {
                showTags(); // 删除Tag成功后更新Tag列表
              });
            }
          });
        });
      });
    }

    showTags();