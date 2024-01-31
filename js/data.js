$(document).ready(function () {

   // 當按鈕被點擊時
   $("#toTopBtn").on('click', function() {
    // 滾動到頁面的最頂部
    $("html, body, main").animate({ scrollTop: 0 }, "slow");
});

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
      // Sorting logic
      data.sort(function (a, b) {
        // Check for exact match in kebalan
        if (a.kebalan === searchTerm) {
          return -1;
        } else if (b.kebalan === searchTerm) {
          return 1;
        }

        // Check for partial match in kebalan
        let aPartialMatchKebalan = a.kebalan.includes(searchTerm);
        let bPartialMatchKebalan = b.kebalan.includes(searchTerm);
        if (aPartialMatchKebalan) {
          return -1;
        } else if (bPartialMatchKebalan) {
          return 1;
        }

        // Check for exact match in definition with kebalan
        if (a.definition.includes(a.kebalan)) {
          return -1;
        } else if (b.definition.includes(b.kebalan)) {
          return 1;
        }

        // Check for partial match in definition
        let aPartialMatchDefinition = a.definition.includes(searchTerm);
        let bPartialMatchDefinition = b.definition.includes(searchTerm);
        if (aPartialMatchDefinition) {
          return -1;
        } else if (bPartialMatchDefinition) {
          return 1;
        }

        return 0; // If none of the conditions are met
      });

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

          // 替换逻辑
          function highlight(match) {
            if (match.toLowerCase() === searchTerm) {
              // 完整匹配
              return `<a class="kbl-word kbl-main">${match}</a>`;
            } else {
              // 部分匹配
              return `<a class="kbl-word kbl-close">${match}</a>`;
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
            // $("#results").append(
            //   `<li class="my-2">
            //                     <div class="row text-card">
            //                         <div class="col-12 py-2">
            //                         <strong>${highlightedkebalan}</strong>
            //                         &emsp;
            //                         <img id="${item.kebalan}" class="playBtn" src="../images/icons/play-btn.svg"  alt="播放聲音"></img>
            //                         </div>
            //                         <div class="col-12 py-2">${highlightedDefinition}</div>
            //                     </div>
            //                 </li>`
            // );

            $("#results").append(
              `<li class="my-2">
                                <div class="row text-card">
                                    <div class="col-12 py-2">
                                    <strong>${highlightedkebalan}</strong>
                                    &emsp;
                                    </div>
                                    <div class="col-12 py-2">${highlightedDefinition}</div>
                                </div>
                            </li>`
            );
          }
        });
      }
    });
  }

    // #region 播放按鈕
   // 當點擊帶有 'playBtn' 類的 img 時執行
  //  $(document).on('click', '.playBtn .kbl-word', function() {
    $(document).on('click', '.kbl-word', function() {
    console.log('audio click');
    var audioId = $(this).attr('id'); // 獲取音樂檔案的標識（這裡假設它是 img 標籤的 id）

    // 執行 AJAX 請求來獲取音樂文件的 URL
    $.ajax({
        url: `https://e-dictionary.ilrdf.org.tw/MultiMedia/audio/ckv/${audioId}_%7B1%7D.mp3`, // 這裡替換為服務器上音樂文件的路徑
        // data: { id: audioId }, // 可以根據需要傳遞額外的數據
        type: 'GET',
        success: function(response) {
            // 假設服務器返回的是音樂文件的 URL
            var musicUrl = response.url;

            // 創建一個新的 audio 元素並播放音樂
            var audio = new Audio(musicUrl);
            console.log('do audio play');
            audio.play();
        },
        error: function(error) {
            // 處理錯誤情況
            console.log('Error fetching music file:', error);
        }
    });
});
  // #endregion 播放按鈕
});
