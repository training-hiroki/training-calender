let cur = new Date();

const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('modalClose');

const pad2 = (value) => String(value).padStart(2, '0');
const getGitHubJsonUrl = () =>
  `https://raw.githubusercontent.com/training-hiroki/strave-calendar-api/refs/heads/main/data.json`;


let githubData = null;
let githubDataPromise = null;

const loadGitHubDataJson = async () => {
  if (githubData) return githubData;
  if (!githubDataPromise) {
    githubDataPromise = fetch(getGitHubJsonUrl())
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        githubData = json;
        return githubData;
      })
      .catch((err) => {
        githubDataPromise = null;
        throw err;
      });
  }
  return githubDataPromise;
};

const getDateKey = (year, month, day) => `${year}-${pad2(month)}-${pad2(day)}`;

const showDialog = (text) => {
  modalText.textContent = text;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
};

const loadGitHubData = async (year, month, day) => {
  const key = getDateKey(year, month, day);
  showDialog(`${year}年 ${month}月 ${day}日\n読み込み中...`);
  try {
    const data = await loadGitHubDataJson();
    // data.json が配列なら、その中から date フィールドで検索
    const items = Array.isArray(data) ? data : [data];
    const foundItems = items.filter(item => item && item.date === key);
    
    if (foundItems.length === 0) {
      showDialog(`選択した日付: ${year}年 ${month}月 ${day}日\nデータが見つかりませんでした。`);
    } else if (foundItems.length === 1) {
      showDialog(`選択した日付: ${year}年 ${month}月 ${day}日\n\n${JSON.stringify(foundItems[0], null, 2)}`);
    } else {
      showDialog(`選択した日付: ${year}年 ${month}月 ${day}日\n\n${JSON.stringify(foundItems, null, 2)}`);
    }
  } catch (error) {
    console.error(error);
    showDialog(`データの取得に失敗しました。\n${error.message}`);
  }
};

const closeDialog = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
};

modalClose.addEventListener('click', closeDialog);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeDialog();
});

function render() {
  const y = cur.getFullYear(), m = cur.getMonth();
  document.getElementById('title').textContent = `${y}年 ${m+1}月`;
  const grid = document.getElementById('grid');
  Array.from(grid.children).forEach(c => { if (!c.classList.contains('lbl')) c.remove(); });

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m+1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const today = new Date();
  const isToday = (d) => today.getFullYear()===y && today.getMonth()===m && today.getDate()===d;

  for (let i = 0; i < first; i++) {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'cell other';
    const dow = i % 7;
    if (dow === 0) c.classList.add('sun');
    if (dow === 6) c.classList.add('sat');
    const day = prevDays - first + 1 + i;
    c.textContent = day;
    c.addEventListener('click', () => {
      const year = m === 0 ? y - 1 : y;
      const month = m === 0 ? 12 : m;
      loadGitHubData(year, month, day);
    });
    grid.appendChild(c);
  }

  for (let d = 1; d <= days; d++) {
    const c = document.createElement('button');
    c.type = 'button';
    const dow = (first + d - 1) % 7;
    c.className = 'cell';
    if (dow === 0) c.classList.add('sun');
    if (dow === 6) c.classList.add('sat');
    if (isToday(d)) c.classList.add('today');
    c.textContent = d;
    c.addEventListener('click', () => {
      loadGitHubData(y, m + 1, d);
    });
    grid.appendChild(c);
  }

  const total = first + days;
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= rem; d++) {
    const c = document.createElement('button');
    c.type = 'button';
    const dow = (total + d - 1) % 7;
    c.className = 'cell other';
    if (dow === 0) c.classList.add('sun');
    if (dow === 6) c.classList.add('sat');
    const day = d;
    c.textContent = day;
    c.addEventListener('click', () => {
      const year = m === 11 ? y + 1 : y;
      const month = m === 11 ? 1 : m + 2;
      loadGitHubData(year, month, day);
    });
    grid.appendChild(c);
  }
}

document.getElementById('prev').addEventListener('click', () => {
  cur = new Date(cur.getFullYear(), cur.getMonth() - 1, 1);
  render();
});
document.getElementById('next').addEventListener('click', () => {
  cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  render();
});

render();
