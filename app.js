const STORAGE_KEY = "pyeongtaek-teacher-boardgame-2026-v1";

const names = [
  "강예원",
  "김민훈",
  "김서연",
  "김태연",
  "박유진",
  "박이슬",
  "배상희",
  "배주미",
  "백지은",
  "서윤아",
  "오다빈",
  "유지현",
  "이성철",
  "이은정",
  "이정현",
  "이종찬",
  "이지온",
  "이혜진",
  "전성진",
  "정수빈",
  "정지민",
  "정하은",
  "조선영",
];

const avatars = [
  { face: "🐰", title: "룰북 마법사" },
  { face: "🐱", title: "카드 기사" },
  { face: "🐥", title: "교실 연금술사" },
  { face: "🐶", title: "말판 탐험가" },
  { face: "🐹", title: "자료 상인" },
  { face: "🦊", title: "전략 요정" },
  { face: "🐻", title: "테이블 수호자" },
  { face: "🐼", title: "협력 정령" },
];

const levels = [
  { count: 0, name: "새싹 교사 모험가" },
  { count: 3, name: "주사위 견습 교사" },
  { count: 7, name: "카드 수업 연구자" },
  { count: 12, name: "말판 클래스 리더" },
  { count: 20, name: "보드게임 수업 장인" },
];

const badges = [
  { id: "speaker", icon: "🎤", name: "수업 무대의 별", rule: "보드게임 활용 수업 사례 발표" },
  { id: "share", icon: "📦", name: "자료 보물상자", rule: "수업 자료를 밴드에 공유" },
  { id: "band", icon: "💬", name: "밴드 반응술사", rule: "밴드에 댓글이나 반응 10개 이상" },
  { id: "mentor", icon: "🧭", name: "새싹 길잡이", rule: "신규 참여 교사에게 관심과 도움을 줌" },
  { id: "master", icon: "🎲", name: "룰 파티 대장", rule: "자유 모임에서 모임 주최" },
  { id: "dinner", icon: "🍽", name: "회식 충전러", rule: "회식 1회 이상 참여" },
  { id: "event", icon: "🎪", name: "행사 출석 용사", rule: "행사 1회 이상 참여" },
  { id: "perfect", icon: "👑", name: "올출석 왕관", rule: "행사 모두 참여" },
  { id: "allround", icon: "🌟", name: "만능 플레이메이커", rule: "발표, 모임 주최, 행사 모두 참여" },
];

const initialState = {
  members: names.map((name, index) => ({
    id: `teacher-${index + 1}`,
    name,
    avatar: index % avatars.length,
    badges: [],
  })),
  logs: [],
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return structuredClone(initialState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function playsFor(memberId) {
  return state.logs.filter((log) => log.memberId === memberId);
}

function levelFor(count) {
  let current = 0;
  levels.forEach((level, index) => {
    if (count >= level.count) current = index;
  });
  const next = levels[current + 1];
  return {
    number: current + 1,
    name: levels[current].name,
    nextCount: next?.count,
  };
}

function render() {
  renderHero();
  renderMemberOptions();
  renderMembers();
  renderLogs();
  renderBadges();
}

function renderHero() {
  const totalGames = state.logs.length;
  const totalBadges = state.members.reduce((sum, member) => sum + member.badges.length, 0);
  $("#memberCount").textContent = `${state.members.length}명`;
  $("#seasonLabel").textContent = `평택 초등교사 ${state.members.length}명`;
  $("#guildSummary").textContent = `${totalGames}개 게임 기록 · ${totalBadges}개 배지 장착`;
}

function renderMemberOptions() {
  const options = state.members.map((member) => `<option value="${member.id}">${member.name}</option>`).join("");
  $("#playerSelect").innerHTML = options;
  $("#badgeMemberSelect").innerHTML = options;
}

function renderMembers() {
  $("#memberGrid").innerHTML = state.members
    .map((member) => {
      const count = playsFor(member.id).length;
      const level = levelFor(count);
      const badgeCount = member.badges.length;
      const avatar = avatars[member.avatar];
      return `
        <article class="member-card" title="${avatar.title} · 게임 ${count}개 · 배지 ${badgeCount}개">
          <div class="avatar-stage">
            <div class="avatar level-${level.number}">${avatar.face}</div>
          </div>
          <div class="member-title">
            <h3>${member.name}</h3>
            <span class="level-pill">Lv.${level.number} · ${badgeCount}뱃지</span>
          </div>
          <p class="class-name">${level.name} · ${avatar.title}</p>
          <p class="meta-line">${count}개 게임 경험${level.nextCount ? ` · 다음 레벨 ${level.nextCount}개` : ""}</p>
        </article>
      `;
    })
    .join("");
}

function renderLogs() {
  $("#logCount").textContent = `${state.logs.length}개`;
  if (!state.logs.length) {
    $("#logList").innerHTML = `<div class="empty-state">오늘 함께한 보드게임을 기록해보세요.</div>`;
    return;
  }

  $("#logList").innerHTML = state.logs
    .slice()
    .reverse()
    .map((log) => {
      const member = state.members.find((item) => item.id === log.memberId);
      return `
        <article class="log-item">
          <div class="log-top">
            <strong>${log.game}</strong>
            <span class="genre-tag">${log.genre}</span>
          </div>
          <p class="meta-line">${member?.name ?? "알 수 없음"} · ${log.companions}</p>
          <p class="meta-line">${log.date}</p>
        </article>
      `;
    })
    .join("");
}

function renderBadges() {
  const memberId = $("#badgeMemberSelect").value || state.members[0]?.id;
  const member = state.members.find((item) => item.id === memberId);
  if (!member) return;

  $("#badgeBoard").innerHTML = badges
    .map((badge) => {
      const earned = member.badges.includes(badge.id);
      return `
        <article class="badge-card ${earned ? "earned" : ""}">
          <div class="badge-icon">${badge.icon}</div>
          <div>
            <h3>${badge.name}</h3>
            <p>${badge.rule}</p>
          </div>
          <button data-badge="${badge.id}">${earned ? "장착" : "달기"}</button>
        </article>
      `;
    })
    .join("");
}

function todayText() {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab, .view").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $(`#${button.dataset.view}View`).classList.add("active");
  });
});

$("#gameForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.logs.push({
    id: crypto.randomUUID(),
    memberId: $("#playerSelect").value,
    game: $("#gameName").value.trim(),
    companions: $("#companions").value.trim(),
    genre: $("#genreSelect").value,
    date: todayText(),
  });
  saveState();
  $("#gameName").value = "";
  $("#companions").value = "";
  render();
});

$("#badgeMemberSelect").addEventListener("change", renderBadges);

$("#badgeBoard").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-badge]");
  if (!button) return;
  const member = state.members.find((item) => item.id === $("#badgeMemberSelect").value);
  if (!member) return;
  const id = button.dataset.badge;
  if (member.badges.includes(id)) {
    member.badges = member.badges.filter((badgeId) => badgeId !== id);
  } else {
    member.badges.push(id);
  }
  saveState();
  render();
});

$("#resetDemo").addEventListener("click", () => {
  state = structuredClone(initialState);
  saveState();
  render();
});

render();
