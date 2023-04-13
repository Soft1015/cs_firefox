function activateListeners() {
  $("#btn-start").click(function () {
    if (!started) {
      if (!localStorage.getItem("url")) {
        alert("please set the url");
        return;
      }
      console.log(document.getElementById('audio'));
      chrome.runtime.sendMessage(
        {
          cmd: "startScraping",
          interval: parseInt(localStorage.getItem("time")) * 1000,
          url: localStorage.getItem("url"),
          audio: document.getElementById('audio')
        },
        function (res) {
          if (res.result == "true") {
            started = true;
            localStorage.setItem("started", "true");
            $("#btn-start").text("Stop");
            $("btn-start").css("background-color", "red");
          }
          loadingDB();
        }
      );
    } else {
      started = false;
      $("btn-start").css("background-color", "green");
      localStorage.setItem("started", "false");
      $("#btn-start").text("Start");
      chrome.runtime.sendMessage({ cmd: "stopScraping" }, function (res) {
        console.log(res);
      });
    }
  });
}
var started = false;
$("#addRowUrl").click(function () {
  var html = "<tr>";
  html += "<td></td>";
  html +=
    "<td class='text-center'><input type='text' class='form-control'></td>";
  html +=
    "<td class='text-center'><div class='radio'><label><input type='radio' name='optradio'></label></div></td>";
  html +=
    "<td class='text-center'><button type='button' class='btn btn-danger btn-sm btn-url-del'>X</button></td></tr>";
  $("#tbody_url").append(html);
});

$(document).on("click", ".btn-url-del", function () {
  $(this).parent().parent().remove();
});

$("#urlSave").click(function () {
  let array = [];
  $("#tbody_url > tr").each(function () {
    let data = {};
    data.url = $(this).find("input[type=text]").val();
    data.checked = $(this).find("input[type=radio]")[0].checked;
    array.push(JSON.stringify(data));
  });
  localStorage.setItem("url", array.join("|"));
  loadUrlData();
});

$("#timeSave").click(function () {
  localStorage.setItem("time", $("#time").val());
});

function loadingDB() {
  loadUrlData();
  if (!localStorage.getItem("time")) {
    localStorage.setItem("time", "3");
  }
  $("#time").val(localStorage.getItem("time"));
  chrome.runtime.sendMessage({ cmd: "getState" }, function (res) {
    if (res.result) {
      if (typeof res.result == 'object') started = res.result == "true" ? true : false;
      else {
        started = res.result == true ? true : false;
      }
    } else {
      started = false;
    }
    if (started) {
      $("#btn-start").text("Stop");
      $("btn-start").css("background-color", "red");
    }
  });
}

function loadUrlData() {
  const text = localStorage.getItem("url");
  if (text) {
    $("#btn-start").show();
    const myArray = text.split("|");
    let i = 1;
    var html = "";
    myArray.forEach((element) => {
      const data = JSON.parse(element);
      const checked = data.checked ? "checked" : "";
      if (data) {
        html += "<tr>";
        html += "<td>" + i + "</td>";
        html += "<td class='text-center'><input type='text' class='form-control' value='" +
          data.url +
          "'></td>";
        html +=
          "<td class='text-center'><div class='radio'><label><input type='radio' name='optradio' " +
          checked +
          "></label></div></td>";
        html +=
          "<td class='text-center'><button type='button' class='btn btn-danger btn-sm btn-url-del'>X</button></td></tr>";
        i++;
      }
    });
    $("#tbody_url").empty();
    $("#tbody_url").append(html);
  } else {
    $("#btn-start").hide();
  }
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    activateListeners();
    loadingDB();
  },
  false
);
window.addEventListener("beforeunload", function (e) {
  chrome.runtime.sendMessage({ cmd: "stopScraping" }, function (res) {
    localStorage.setItem("started", "false");
  });
});

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  if (req.cmd == "playSound") {
    console.log('palySound')
  }
  sendResponse({ result: 'true' });
});