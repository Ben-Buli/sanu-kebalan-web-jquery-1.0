$(document).ready(function () {
  // 首先檢查 sessionStorage 是否已有數據
  let storedData = sessionStorage.getItem("kbl");
  if (storedData) {
    console.log("data length", JSON.parse(storedData).length);
    processData(JSON.parse(storedData));
  } else {
    // 如果沒有，則從 data.json 加載
    $.ajax({
      url: "./data/data.json",
      dataType: "json",
    })
      .done(function (result) {
        console.log("success");
        console.log("result: ", result);
        sessionStorage.setItem("kbl", JSON.stringify(result));
        processData(result);
      })
      .fail(function (ex) {
        console.log("error");
        console.log("ex: ", ex);
      });
  }

  // 修正噶瑪蘭語大小寫格式
  $("#searchInput").on("input", function () {
    var value = $(this).val();

    // 将所有的 'R' 或 'r' 替换为大写的 'R'
    value = value.replace(/r/gi, "R");

    // 使用正则表达式将除 'R' 之外的所有字母转换为小写
    value = value.replace(/[^R]/g, function (match) {
      return match.toLowerCase();
    });

    // 更新输入框的值
    $(this).val(value);
  });

  // 是否為中文
  function isChinese(text) {
    return /[\u4e00-\u9fff]/.test(text);
  }

  // 輸入並查詢資料
  function processData(data) {
    $("#searchInput").on("submit input", function () {
      let searchTerm = $(this).val().toLowerCase();
      $("#results").empty();

      // 檢查 searchTerm 的長度: 字符1個字以下，或非中文
      if (searchTerm.length <= 1 && !isChinese(searchTerm)) {
        return; // 如果 searchTerm 下於或等於 1 个字符，则不執行後續操作
      }

      // 从 sessionStorage 获取数据并解析为 JSON 对象
      let data = JSON.parse(sessionStorage.getItem("kbl"));

      if (searchTerm && data) {
        // 使用 JavaScript 原生的 forEach 方法来遍历数据
        data.forEach(function (item) {
          // 创建一个正则表达式，匹配整个词
          let regexWholeWord = new RegExp("\\b" + searchTerm + "\\b", "gi");
          // 创建一个正则表达式，匹配包含 searchTerm 的部分词
          let regexPartWord = new RegExp(
            "\\b\\w*" + searchTerm + "\\w*\\b",
            "gi"
          );

          console.log(item);
          // 替换逻辑
          function highlight(match) {
            if (match.toLowerCase() === searchTerm) {
              // 完整匹配
              return `<a class="text-danger">${match}</a>`;
            } else {
              // 部分匹配
              return `<a class="text-success">${match}</a>`;
            }
          }

          let highlightedkebalan = item.kebalan.replace(
            regexPartWord,
            highlight
          );
          let highlightedDefinition = item.definition.replace(
            regexPartWord,
            highlight
          );

          if (
            item.kebalan.toLowerCase().includes(searchTerm) ||
            (item.stem && item.stem.toLowerCase().includes(searchTerm)) ||
            item.definition.toLowerCase().includes(searchTerm)
          ) {
            $("#results").append(
              `<li class="my-2">
                                <div class="row text-card">
                                    <div class="col-12 py-2"><strong>${highlightedkebalan}</strong></div>
                                    <div class="col-12 py-2">${highlightedDefinition}</div>
                                </div>
                            </li>`
            );
          }
        });
      }
    });
  }
});
