let cur = new Date();

const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('modalClose');

const pad2 = (value) => String(value).padStart(2, '0');

const getGitHubJsonUrl = () =>
'https://raw.githubusercontent.com/training-hiroki/strave-calendar-api/main/data.json';

let githubData = null;
let githubDataPromise = null;

const loadGitHubDataJson = async () => {
  if (githubData) return githubData;

  if (!githubDataPromise) {
    githubDataPromise = fetch(getGitHubJsonUrl())
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        githubData = json;
        return json;
      })
      .catch(err => {
        githubDataPromise = null;
        throw err;
      });
  }

  return githubDataPromise;
};

const getDateKey = (year, month, day) =>
`${year}-${pad2(month)}-${pad2(day)}`;

const formatDateJapanese = (dateStr) => {
  if (!dateStr) return '';

  const [y, m, d] = dateStr.split('-');

  return `${y}年 ${Number(m)}月 ${Number(d)}日`;
};

const formatActivity = (item, index = null) => {

  const movingTime =
    item.moving_time_text ||
    (
      item.moving_time_sec
      ? `${Math.floor(item.moving_time_sec / 60)}:${pad2(item.moving_time_sec % 60)}`
      : ''
    );

  let s = '';

  if (index !== null) {
    s += `【${index + 1}本目】\n\n`;
  }

  if (item.name) {
    s += `🏃 活動名：${item.name}\n`;
  }

  if (item.type) {
    s += `🏷 種別：${item.type}\n`;
  }

  if (item.distance_km != null) {
    s += `📏 距離：${item.distance_km} km\n`;
  }

  if (movingTime) {
    s += `⏱ 移動時間：${movingTime}\n`;
  }

  if (item.pace) {
    s += `⚡ ペース：${item.pace}\n`;
  }

  if (item.avg_heartrate != null) {
    s += `❤️ 平均心拍：${item.avg_heartrate} bpm\n`;
  }

  if (item.max_heartrate != null) {
    s += `🔥 最大心拍：${item.max_heartrate} bpm\n`;
  }

  return s;
};

const showDialog = (text) => {
  modalText.textContent = text;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
};

const loadGitHubData = async (year, month, day) => {

  const key = getDateKey(year, month, day);

  showDialog('読み込み中...');

  try {

    const data = await loadGitHubDataJson();

    const items =
      Array.isArray(data)
      ? data
      : [data];

    const foundItems =
      items.filter(
        item => item?.date === key
      );

    if (foundItems.length === 0) {

      showDialog(
`${year}年 ${month}月 ${day}日

データがありません`
      );

      return;
    }

    let text =
`${year}年 ${month}月 ${day}日

`;

    text += foundItems
      .map((item, index) =>
        formatActivity(item, foundItems.length > 1 ? index : null)
      )
      .join('\n-----------------\n\n');

    showDialog(text);

  } catch (error) {

    console.error(error);

    showDialog(
`取得失敗

${error.message}`
    );

  }

};

const closeDialog = () => {

  modal.classList.remove('open');

  modal.setAttribute(
    'aria-hidden',
    'true'
  );

};

modalClose.addEventListener(
  'click',
  closeDialog
);

modal.addEventListener(
  'click',
  (e) => {
    if (e.target === modal) {
      closeDialog();
    }
  }
);

function render() {

  const y = cur.getFullYear();

  const m = cur.getMonth();

  document.getElementById(
    'title'
  ).textContent =
`${y}年 ${m + 1}月`;

  const grid =
    document.getElementById(
      'grid'
    );

  Array
    .from(grid.children)
    .forEach(c => {
      if (!c.classList.contains('lbl')) {
        c.remove();
      }
    });

  const first =
    new Date(y, m, 1).getDay();

  const days =
    new Date(y, m + 1, 0).getDate();

  const prevDays =
    new Date(y, m, 0).getDate();

  const today =
    new Date();

  const isToday =
    d =>
      today.getFullYear() === y &&
      today.getMonth() === m &&
      today.getDate() === d;

  for (let i = 0; i < first; i++) {

    const day =
      prevDays -
      first +
      1 +
      i;

    createCell(
      grid,
      day,
      'other',
      () => {

        loadGitHubData(
          m === 0 ? y - 1 : y,
          m === 0 ? 12 : m,
          day
        );

      }
    );

  }

  for (
    let d = 1;
    d <= days;
    d++
  ) {

    createCell(
      grid,
      d,
      isToday(d)
        ? 'today'
        : '',
      () =>
        loadGitHubData(
          y,
          m + 1,
          d
        )
    );

  }

}

function createCell(
  grid,
  day,
  extraClass,
  click
) {

  const c =
    document.createElement(
      'button'
    );

  c.type =
    'button';

  c.className =
`cell ${extraClass}`;

  c.textContent =
    day;

  c.addEventListener(
    'click',
    click
  );

  grid.appendChild(c);

}

document
.getElementById(
'prev'
)
.addEventListener(
'click',
() => {

cur =
new Date(
cur.getFullYear(),
cur.getMonth()-1,
1
);

render();

}
);

document
.getElementById(
'next'
)
.addEventListener(
'click',
() => {

cur =
new Date(
cur.getFullYear(),
cur.getMonth()+1,
1
);

render();

}
);

render();
