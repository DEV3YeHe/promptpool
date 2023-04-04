let icon;
let selection;

function removeIcon() {
  if (icon) {
    // 实现图标缩小、透明度减小的效果
    let opacity = 1;
    const interval = setInterval(() => {
      opacity -= 0.1;
      icon.style.opacity = opacity;
      icon.style.width = `${parseFloat(icon.style.width) * 0.9}px`;
      icon.style.height = `${parseFloat(icon.style.height) * 0.9}px`;
      if (opacity <= 0) {
        clearInterval(interval);
        // 一秒后移除元素
        setTimeout(() => {
          icon.remove();
          selection.removeAllRanges();
          icon = null;
        }, 100);
      }
    }, 10);
    
    
  }
}


document.addEventListener("mouseup", function() {
  if (!icon) {
    selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      let rangeCount = selection.rangeCount;
      if (rangeCount > 0) {
        icon = document.createElement("img");
        icon.src = chrome.runtime.getURL("image/ppicon32.png");
        icon.className = "promptpool-icon";
        icon.style.cssText = `
          position: absolute;
          top: ${selection.getRangeAt(0).getBoundingClientRect().bottom + window.pageYOffset - 50}px;
          left: ${selection.getRangeAt(0).getBoundingClientRect().left + window.pageXOffset - 10}px;
          width: 24px;
          height: 24px;
          cursor: pointer;
        `;
        document.body.appendChild(icon);

        icon.addEventListener("click", function() {
          chrome.runtime.sendMessage({ type: "saveToPool", text: selectedText }, function(response) {
            console.log(JSON.stringify(response) + "<返回的response");
            if (response.status) {
              removeIcon();
            }
          });
        });
      }
    }
  }
});




document.addEventListener("mousedown", function(event) {
  if (icon && !event.target.classList.contains('promptpool-icon')) {
    removeIcon();
  }
});
