let selected = "";

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function showCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  document.getElementById("monthTitle").innerText =
    currentYear + "年" + (currentMonth + 1) + "月";

  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 1; i <= lastDay; i++) {
    let btn = document.createElement("button");
    btn.innerText = i;

    btn.onclick = function () {
      selected = currentYear + "-" + (currentMonth + 1) + "-" + i;

      document.getElementById("date").innerText =
        currentYear + "年" + (currentMonth + 1) + "月" + i + "日";

      let data = localStorage.getItem(selected);
      document.getElementById("memo").value = data || "";
    };

    calendar.appendChild(btn);
  }
}

function prevMonth() {
  currentMonth--;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  selected = "";
  document.getElementById("memo").value = "";
  document.getElementById("date").innerText = "";

  showCalendar();
}

function nextMonth() {
  currentMonth++;

  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  selected = "";
  document.getElementById("memo").value = "";
  document.getElementById("date").innerText = "";

  showCalendar();
}

function save() {
  if (selected === "") {
    alert("日付を選んでください");
    return;
  }

  let text = document.getElementById("memo").value;
  localStorage.setItem(selected, text);
  alert("保存しました");
}

showCalendar();