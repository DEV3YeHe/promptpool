const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultDiv = document.getElementById("result");
const countRes = document.getElementById("countres");
const countAll = document.getElementById("countall");
// const exportButton = document.getElementById("export-button");
// const importButton = document.getElementById("import-button");

// searchButton.addEventListener("click", searchInPool);

searchInput.focus();

// Show total entries count on window open
chrome.storage.local.get({ pool: [] }, function(result) {
  const pool = result.pool;
  countAll.innerText = `${pool.length}`;
});

// exportButton.addEventListener("click", exportPool);
// importButton.addEventListener("click", importPool);

searchInput.addEventListener("keydown", function(event) {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (event.key === "Enter" && searchTerm) {
    searchInPool();
  }
});

function searchInPool() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    return;
  }

  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    const matchedTexts = pool.filter(text => text.toLowerCase().includes(searchTerm)).slice(0, 50);

    if (matchedTexts.length === 0) {
      resultDiv.innerHTML = "<p style=\'border:none;color:#eeeeee;\'>No result found.</p>";
    } else {
      resultDiv.innerHTML = matchedTexts.map(text => "<p>" + text + "</p>").join("");

      const resultItems = document.querySelectorAll("#result p");

      resultItems.forEach(item => {
        item.addEventListener("click", function() {
          copyToClipboard(item.innerText);
        });
      });
    }

    // Update count
    countRes.innerText = `${matchedTexts.length}/`;
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



