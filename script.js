let cur = new Date();
let allData = [];
let weekOffset = 0;

const DATA_URL =
  'https://raw.githubusercontent.com/training-hiroki/strave-calendar-api/main/data.json';

const pad2 = n => String(n).padStart(2, '0');

const grid = document.getElementById('grid');
const title = document.getElementById('title');

const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('modalClose');

const getDateKey = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

async function loadData() {
  const res = await fetch(DATA_URL);
  allData = await res.json();
}

function getMonthItems(y, m) {
  return allData.filter(item => item.date?.startsWith(`${y}-${pad2(m)}`));
}

function getDateItems(dateKey) {
  return allData.filter(item => item.date === dateKey);
}

function sumDistance(items) {
  return items
    .filter(item => item.type === 'ランニング')
    .reduce((sum, item) => sum + Number(item.distance_km || 0), 0);
}

function getWeekRange(offset = 0) {
  const base = new Date();
  base.setDate(base.getDate() + offset * 7);

  const dayOfWeek = base.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

function renderSummary(y, m) {
  const monthItems = getMonthItems(y, m + 1);
  const monthDistance = sumDistance(monthItems);

  document.getElementById('monthLabel').textContent = `${y}年${m + 1}月の距離`;
  document.getElementById('monthDistance').textContent = `${monthDistance.toFixed(2)} km`;
  document.getElementById('monthRuns').textContent = `${monthItems.length}回のラン`;

  const { monday, sunday } = getWeekRange(weekOffset);

  const weekItems = allData.filter(item => {
    const d = new Date(item.date);
    return d >= monday && d <= sunday;
  });

  document.getElementById('weekRange').textContent =
    `${monday.getMonth() + 1}/${monday.getDate()}〜${sunday.getMonth() + 1}/${sunday.getDate()}`;

  document.getElementById('weekDistance').textContent =
    `${sumDistance(weekItems).toFixed(2)} km`;

  document.getElementById('weekRuns').textContent =
    `${weekItems.length}回のラン`;

  renderRecent(monthItems);
  drawMonthChart(y, m + 1, monthItems);
}

function renderRecent(items) {
  const box = document.getElementById('recentList');

  const recent = [...items]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  box.innerHTML = recent.map(item => `
    <div class="recent-item">
      <span>${item.date.slice(5)}</span>
      <span>${item.name}</span>
      <span>${item.distance_km}km</span>
      <span>${item.pace}</span>
    </div>
  `).join('');
}

function drawMonthChart(y, m, items) {
  const canvas = document.getElementById('monthChart');
  const ctx = canvas.getContext('2d');

  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = 160;

  ctx.clearRect(0, 0, w, h);

  const days = new Date(y, m, 0).getDate();
  const daily = Array(days).fill(0);

  items.forEach(item => {
    const day = Number(item.date.slice(8, 10));
    daily[day - 1] += Number(item.distance_km || 0);
  });

  const max = Math.max(...daily, 10);
  const barW = w / days;

  ctx.fillStyle = '#1976d2';

  daily.forEach((km, i) => {
    const barH = (km / max) * (h - 30);
    ctx.fillRect(i * barW + 2, h - barH - 20, barW - 4, barH);
  });

  ctx.fillStyle = '#555';
  ctx.font = '12px sans-serif';
  ctx.fillText('km', 4, 12);
}

function renderCalendar() {
  const y = cur.getFullYear();
  const m = cur.getMonth();

  title.textContent = `${y}年 ${m + 1}月`;

  [...grid.children].forEach(child => {
    if (!child.classList.contains('lbl')) child.remove();
  });

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  for (let i = 0; i < first; i++) {
    const empty = document.createElement('div');
    empty.className = 'cell other';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= days; d++) {
    const dateKey = getDateKey(y, m + 1, d);
    const items = getDateItems(dateKey);
    const distance = sumDistance(items);

    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.innerHTML = `
      <div class="day-num">${d}</div>
      ${items.length ? `<div class="run-dot"></div><div class="run-distance">${distance.toFixed(2)} km</div>` : ''}
    `;

    cell.addEventListener('click', () => showDayDetail(y, m + 1, d, items));
    grid.appendChild(cell);
  }

  renderSummary(y, m);
}

function showDayDetail(y, m, d, items) {
  if (!items.length) {
    modalText.textContent = `${y}年 ${m}月 ${d}日\n\nデータがありません`;
  } else {
    modalText.textContent =
      `${y}年 ${m}月 ${d}日\n\n` +
      items.map((item, i) => `
【${i + 1}本目】
活動名: ${item.name}
種別: ${item.type}
距離: ${item.distance_km} km
時間: ${item.moving_time_text}
ペース: ${item.pace}
平均心拍: ${item.avg_heartrate} bpm
最大心拍: ${item.max_heartrate} bpm
`).join('\n-----------------\n');
  }

  modal.classList.add('open');
}

modalClose.addEventListener('click', () => {
  modal.classList.remove('open');
});

document.getElementById('prev').addEventListener('click', () => {
  cur = new Date(cur.getFullYear(), cur.getMonth() - 1, 1);
  renderCalendar();
});

document.getElementById('next').addEventListener('click', () => {
  cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  renderCalendar();
});

document.getElementById('prevWeek').addEventListener('click', () => {
  weekOffset--;
  renderCalendar();
});

document.getElementById('nextWeek').addEventListener('click', () => {
  weekOffset++;
  renderCalendar();
});

loadData().then(renderCalendar);
