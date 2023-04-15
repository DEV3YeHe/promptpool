const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultDiv = document.getElementById("result");
const countRes = document.getElementById("countres");
const countAll = document.getElementById("countall");

searchInput.focus();

const settingsBtn = document.getElementById('settings');
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Show total entries count on window open
chrome.storage.local.get({ pool: [] }, function(result) {
  const pool = result.pool;
  countAll.innerText = `${pool.length}`;
});

searchInput.addEventListener("keydown", function(event) {
  const searchTerm = searchInput.value.trim().toLowerCase();
  console.log('type:'+searchTerm);
  if (event.key === "Enter" && searchTerm) {
    searchInPool();
  }
});

chrome.storage.local.get({ tags: [] }, function(result) {
  const tags = result.tags;
  const tagSelect = document.getElementById("tag-select");
  tags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.innerText = tag;
    tagSelect.appendChild(option);
  });
});


function searchInPool() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedTag = document.getElementById("tag-select").value;
  if (!searchTerm && !selectedTag) {
    return;
  }
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    let filteredItems = pool;
    if (selectedTag) {
      filteredItems = pool.filter(item => item.tags.includes(selectedTag));
    }
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => item.text.toLowerCase().includes(searchTerm));
    }
    const matchedItems = filteredItems.slice(0, 50);
    if (matchedItems.length === 0) {
      resultDiv.innerHTML = "<p style=\'border:none;color:#eeeeee;\'>No result found.</p>";
    } else {
      resultDiv.innerHTML = matchedItems.map(item => `
        <div>
          <p style="padding: 5px;">${item.text}</p>
          <p style="background-color: #999; color: black; font-size:10px; margin-bottom:5px; border:none;">${item.msg}</p>
        </div>
      `).join("");
      const resultItems = document.querySelectorAll("#result p");
      resultItems.forEach(item => {
        item.addEventListener("click", function() {
          copyToClipboard(item.innerText);
        });
      });
    }
    countRes.innerText = `${matchedItems.length}/`;
  });
}




function copyToClipboard(text) {
  const tempInput = document.createElement("textarea");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  const icon = document.createElement("div");
  icon.innerHTML = "&#10004;"+"Copied";
  icon.className = "copy-icon";
  document.body.appendChild(icon);

  setTimeout(function() {
    document.body.removeChild(icon);
  }, 1500);
}

// function exportPool() {
//   chrome.storage.local.get({ pool: [] }, function(result) {
//     const pool = result.pool;
//     const textToSave = pool.join("\n");

//     const blob = new Blob([textToSave], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);

//     const filename = "PromptPool.txt";
//     const downloadLink = document.createElement("a");
//     downloadLink.download = filename;
//     downloadLink.href = url;
//     document.body.appendChild(downloadLink);
//     downloadLink.click();
//     document.body.removeChild(downloadLink);

//     const message = document.createElement("span");
//     message.innerText = "Saved successfully";
//     message.className = "success-message";
//     document.body.appendChild(message);

//     setTimeout(function() {
//       document.body.removeChild(message);
//     }, 1500);
//   });
// }

// function importPool() {
//   const input = document.createElement("input");
//   input.type = "file";
//   input.accept = ".txt";
//   input.addEventListener("change", function() {
//     const file = input.files[0];
//     const reader = new FileReader();
//     reader.readAsText(file);
//     reader.onload = function() {
//       const text = reader.result;
//       const items = text.trim().split("\n");
//       chrome.storage.local.get({ pool: [] }, function(result) {
//         const existingPool = result.pool;
//         const newItems = items.filter(item => !existingPool.includes(item)); // 过滤掉已存在的文案
//         const newPool = [...existingPool, ...newItems];
//         chrome.storage.local.set({ pool: newPool }, function() {
//           const successMessage = document.createElement("span");
//           successMessage.innerText = `Imported ${newItems.length} items successfully.`; // 更新成功导入的文案数量
//           successMessage.className = "success-message";
//           document.body.appendChild(successMessage);
//           setTimeout(function() {
//             document.body.removeChild(successMessage);
//           }, 1500);

//           chrome.storage.local.get({ pool: [] }, function(result) {
//             const pool = result.pool;
//             countAll.innerText = `Total: ${pool.length}`;
//           });
//         });
//       });
//     };
//   });
//   input.click();
// }



