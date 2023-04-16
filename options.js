const importButton = document.getElementById("import-button");
const exportButton = document.getElementById("export-button");
const saveTagButton = document.getElementById("save-tag-button");
const tagInput = document.getElementById("tag-input");
const tagResult = document.getElementById("tag-result");
const tagList = document.getElementById("tag-list");
const langSelect = document.getElementById("lang-select");
const langOptions = {
  'zh': '简体中文',
  'jp': '日本語',
  'kor': '한국인',
  'ru': 'Корейский'
};
const walletIcon = document.querySelector('.wallet-icon');
const popupContainer = document.querySelector('.popup-container');
const closeButton = document.querySelector('.close-button');
const countAll = document.getElementById("countall");
const countAllTagSpan = document.getElementById("countalltag");

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
        content.classList.add('active');
      } else {
        content.style.display = 'none';
        content.classList.remove('active');
      }
    });
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

chrome.storage.local.get({ pool: [] }, function(result) {
  const pool = result.pool;
  countAll.innerText = `(${pool.length})`;
});


let isPopupOpen = false;

walletIcon.addEventListener('click', () => {
  if (!isPopupOpen) {
    popupContainer.style.display = 'flex';
    isPopupOpen = true;
  }
});

closeButton.addEventListener('click', () => {
  popupContainer.style.display = 'none';
  isPopupOpen = false;
});



let lang = 'zh'; // Set default value
chrome.storage.sync.get(['lang'], function(result) {
  if (result.lang) {
    lang = result.lang;
  } else {
    chrome.storage.sync.set({ lang: lang }, function() {
      console.log('Language is set to ' + lang);
    });
  }
  langSelect.value = lang;
});

langSelect.addEventListener('change', () => {
  const selectedLang = langSelect.value;
  lang = selectedLang;
  chrome.storage.sync.set({ lang: lang }, function() {
    const langOption = langOptions[selectedLang];
    console.log(`Language changed to: ${langOption}`);
    // Do something to update UI based on selected language
  });
});


function showPool() {
  console.log('showPool');
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    const poolCards = document.getElementById('pool-cards');
    poolCards.innerHTML = '';

    chrome.storage.local.get({ tags: [] }, function(tagResult) {
      const tags = tagResult.tags;
      const checkedTags = Array.from(document.querySelectorAll('input[name="tag-checkbox"]:checked')).map(el => el.value);
      pool.filter(item => {
        return item.tags.split(',').some(tag => checkedTags.includes(tag.trim()));
      }).forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

        // 添加图片
        const img = document.createElement('img');
        img.src = item.img;
        const link = document.createElement('a');
        link.href = item.img;
        link.target = '_blank';
        link.appendChild(img);
        card.appendChild(link);

        // 添加卡片内容
        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        // 添加卡片标签
        const cardTags = document.createElement('div');
        cardTags.classList.add('card-tags');
        const tagLabels = item.tags.split(',').map(tag => {
          return `<div class="tag">${tag.trim()}</div>`;
        }).join('');
        cardTags.innerHTML = tagLabels;
        cardContent.appendChild(cardTags);

        // 添加prompt
        const prompt = document.createElement('div');
        prompt.classList.add('card-prompt');
        prompt.textContent = item.text;
        prompt.addEventListener('mouseover', function() {
          prompt.style.cursor = 'pointer';
        });
        prompt.addEventListener('click', function() {
          navigator.clipboard.writeText(prompt.textContent).then(function() {
            prompt.style.animation = 'blink 0.1s linear 2';
          });
        });
        cardContent.appendChild(prompt);

        // 显示msg值
        const msg = document.createElement('div');
        msg.textContent = item.msg;
        msg.classList.add('pool-msg');
        cardContent.appendChild(msg);
        card.appendChild(cardContent);

        // 添加卡片操作
        const cardOptions = document.createElement('div');
        cardOptions.classList.add('card-options');
        const delBtn = document.createElement('button');
        delBtn.textContent = 'DEL';
        delBtn.classList.add('error-button');
        delBtn.onclick = function() {
          delpoolob(index);
        };
        cardOptions.appendChild(delBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('main-button');
        editBtn.onclick = function() {
          editpoolob(index, item);
        };
        cardOptions.appendChild(editBtn);
        card.appendChild(cardOptions);

        poolCards.appendChild(card);

      });
    });
  });
}




function delpoolob(index) {
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    pool.splice(index, 1); // 删除对应的对象
    chrome.storage.local.set({ pool: pool }, function() {
      showPool(); // 更新界面
    });
  });
}

function editpoolob(index, item) {
  // 创建输入框和按钮
  const imgInput = document.createElement('input');
  imgInput.type = 'text';
  imgInput.value = item.img;
  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = item.text;
  const msgInput = document.createElement('input');
  msgInput.type = 'text';
  msgInput.value = item.msg;
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.value = item.tags;
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.onclick = function() {
    item.img = imgInput.value;
    item.text = textInput.value;
    item.msg = msgInput.value;
    item.tags = tagsInput.value;
    chrome.storage.local.get({ pool: [] }, function(result) {
      const pool = result.pool;
      pool[index] = item;
      chrome.storage.local.set({ pool: pool }, function() {
        showPool();
        collectTags();
        dialog.close(); // 更新界面并关闭弹窗
      });
    });
  };
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = function() {
    dialog.close(); // 关闭弹窗
  };

  // 创建弹窗并显示
  const dialog = document.createElement('dialog');
  const form = document.createElement('form');
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = 'Edit Pool Object';
  fieldset.appendChild(legend);
  const imgLabel = document.createElement('label');
  imgLabel.textContent = 'IMG:';
  imgLabel.appendChild(imgInput);
  fieldset.appendChild(imgLabel);
  const textLabel = document.createElement('label');
  textLabel.textContent = 'Prompt:';
  textLabel.appendChild(textInput);
  fieldset.appendChild(textLabel);
  const msgLabel = document.createElement('label');
  msgLabel.textContent = 'Translation:';
  msgLabel.appendChild(msgInput);
  fieldset.appendChild(msgLabel);
  const tagsLabel = document.createElement('label');
  tagsLabel.textContent = 'Tags:';
  tagsLabel.appendChild(tagsInput);
  fieldset.appendChild(tagsLabel);
  form.appendChild(fieldset);
  const btnGroup = document.createElement('div');
  btnGroup.classList.add('btn-group');
  btnGroup.appendChild(saveBtn);
  btnGroup.appendChild(cancelBtn);
  form.appendChild(btnGroup);
  dialog.appendChild(form);
  document.body.appendChild(dialog);
  dialog.showModal();
}

// 显示界面
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
        const updatedItems = [];
        const newItems = items.filter(item => {
          let hasChanged = false;
          const existingItem = existingPool.find(existingItem => existingItem.text === item.text);
          if (existingItem) {
            // use Object.keys() to filter out any unexpected keys in item
            const updatedItem = Object.keys(item).reduce((obj, key) => {
              if (existingItem.hasOwnProperty(key) && existingItem[key] !== item[key]) {
                obj[key] = item[key];
                hasChanged = true;
              } else {
                obj[key] = existingItem[key];
              }
              return obj;
            }, {});
            if (hasChanged) {
              updatedItems.push(updatedItem);
            }
            return false;
          } else {
            return true;
          }
        });
        const newPool = [...existingPool, ...newItems, ...updatedItems];
        chrome.storage.local.set({ pool: newPool }, function() {
          const successMessage = document.createElement("span");
          successMessage.innerText = `Imported ${newItems.length} new items, updated ${updatedItems.length} items successfully.`;
          successMessage.className = "success-message";
          document.body.appendChild(successMessage);
          setTimeout(function() {
            document.body.removeChild(successMessage);
            collectTags();
          }, 1500);
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
  console.log('collectTags');
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    let tags = [];
    for (let item of pool) {
      if (item.tags && item.tags.length > 0 && !item.tags.includes('default')) {
        tags = tags.concat(item.tags);
      }
    }
    chrome.storage.local.get({ tags: [] }, function(result) {
      const existingTags = result.tags;
      // Remove 'default' from existing tags
      const index = existingTags.indexOf('default');
      if (index > -1) {
        existingTags.splice(index, 1);
      }
      // Remove duplicates and add new tags
      const newTags = new Set([...existingTags, ...tags]);
      chrome.storage.local.set({ tags: Array.from(newTags) }, function() {
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
  chrome.storage.local.get({ tags: [], checkedTags: [] }, function(result) {
    const tags = result.tags;
    countAllTagSpan.innerText = `(${tags.length+1})`;
    tags.unshift('default');
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
      // console.log(JSON.stringify(response) + "< tags");
    });
    const tagCheckbox = document.getElementById("tag-checkbox");
    const checkedTags = result.checkedTags;
    const tagCheckboxHtml = tags.map(tag => {
      const isChecked = tag === 'default' || checkedTags.includes(tag) ? 'checked' : '';
      return `
        <div style="display: flex; align-items: center; margin-right: 10px;">
          <input type="checkbox" name="tag-checkbox" value="${tag}" ${isChecked}>
          <label style="margin-left: 5px;">${tag}</label>
        </div>
      `;
    }).join("");

    tagCheckbox.innerHTML = tagCheckboxHtml;
    tagCheckbox.addEventListener("change", function() {
      const checkedTags = Array.from(document.querySelectorAll('input[name="tag-checkbox"]:checked')).map(el => el.value);
      chrome.storage.local.set({ checkedTags });
      showPool();
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