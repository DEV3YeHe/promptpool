// const nameInput = document.getElementById("name");
// const emailInput = document.getElementById("email");
// const saveButton = document.getElementById("save");

// chrome.storage.local.get(["name", "email"], function(result) {
//   nameInput.value = result.name || "";
//   emailInput.value = result.email || "";
// });

// saveButton.addEventListener("click", function() {
//   const name = nameInput.value.trim();
//   const email = emailInput.value.trim();
//   chrome.storage.local.set({ name: name, email: email }, function() {
//     alert("Settings saved.");
//   });
// });


const exportButton = document.getElementById("export-button");
const importButton = document.getElementById("import-button");

exportButton.addEventListener("click", exportPool);
importButton.addEventListener("click", importPool);


function exportPool() {
  chrome.storage.local.get({ pool: [] }, function(result) {
    const pool = result.pool;
    const textToSave = pool.join("\n");

    const blob = new Blob([textToSave], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const filename = "PromptPool.txt";
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
  input.accept = ".txt";
  input.addEventListener("change", function() {
    const file = input.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
      const text = reader.result;
      const items = text.trim().split("\n");
      chrome.storage.local.get({ pool: [] }, function(result) {
        const existingPool = result.pool;
        const newItems = items.filter(item => !existingPool.includes(item)); // 过滤掉已存在的文案
        const newPool = [...existingPool, ...newItems];
        chrome.storage.local.set({ pool: newPool }, function() {
          const successMessage = document.createElement("span");
          successMessage.innerText = `Imported ${newItems.length} items successfully.`; // 更新成功导入的文案数量
          successMessage.className = "success-message";
          document.body.appendChild(successMessage);
          setTimeout(function() {
            document.body.removeChild(successMessage);
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