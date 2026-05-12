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
let editingLogId = null;
let selectedMemberId = null;

const $ = (selector) => document.querySelector(selector);

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return structuredClone(initialState);
  }

  const parsed = JSON.parse(saved);
  return {
    members: parsed.members?.length ? parsed.members : structuredClone(initialState.members),
    logs: parsed.logs ?? [],
  };
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
  renderLevelGuide();
  renderMemberOptions();
  renderQuickPanel();
  renderMembers();
  renderLogs();
  renderBadges();
}

function renderHero() {
  const totalGames = state.logs.length;
  const totalBadges = state.members.reduce((sum, member) => sum + member.badges.length, 0);
  const progressScore = totalGames * 2 + totalBadges;
  const targetScore = 60;
  const progressPercent = Math.min(100, Math.round((progressScore / targetScore) * 100));
  const filledTiles = Math.min(9, Math.floor((progressPercent / 100) * 9));
  $("#memberCount").textContent = `${state.members.length}명`;
  $("#seasonLabel").textContent = `평택 초등교사 ${state.members.length}명`;
  $("#guildSummary").textContent = `${totalGames}개 게임 기록 · ${totalBadges}개 배지 장착`;
  $("#meterFill").style.width = `${Math.max(progressPercent, totalGames || totalBadges ? 8 : 0)}%`;
  $("#meterCaption").textContent =
    progressScore === 0
      ? "첫 칸을 기다리는 중"
      : `모험판 ${progressPercent}% 충전 · 기록 1개는 2칸 힘`;
  $("#boardProgress").innerHTML = Array.from({ length: 9 }, (_, index) => {
    const filled = index < filledTiles || (progressScore > 0 && index === 0);
    const current = filled && index === Math.max(0, filledTiles - 1);
    return `<div class="board-tile ${filled ? "filled" : ""} ${current ? "current" : ""}">${index + 1}</div>`;
  }).join("");
}

function renderLevelGuide() {
  $("#levelGuide").innerHTML = levels
    .map((level, index) => {
      const label = level.count === 0 ? "시작" : `${level.count}개`;
      return `<div class="level-chip"><strong>Lv.${index + 1}</strong><span>${label}</span></div>`;
    })
    .join("");
}

function renderMemberOptions() {
  const options = state.members.map((member) => `<option value="${member.id}">${member.name}</option>`).join("");
  $("#playerSelect").innerHTML = options;
  $("#badgeMemberSelect").innerHTML = options;
  if (selectedMemberId && state.members.some((member) => member.id === selectedMemberId)) {
    $("#playerSelect").value = selectedMemberId;
    $("#badgeMemberSelect").value = selectedMemberId;
  }
}

function renderQuickPanel() {
  const member = state.members.find((item) => item.id === selectedMemberId);
  if (!member) {
    $("#quickPanel").hidden = true;
    return;
  }

  const count = playsFor(member.id).length;
  const badgeCount = member.badges.length;
  $("#quickPanel").hidden = false;
  $("#quickName").textContent = `${member.name} 선택됨`;
  $("#quickMeta").textContent = `게임 ${count}개 · 배지 ${badgeCount}개`;
}

function renderMembers() {
  $("#memberGrid").innerHTML = state.members
    .map((member) => {
      const count = playsFor(member.id).length;
      const level = levelFor(count);
      const badgeCount = member.badges.length;
      const avatar = avatars[member.avatar] ?? avatars[0];
      return `
        <article class="member-card ${selectedMemberId === member.id ? "selected" : ""}" data-member="${member.id}" role="button" tabindex="0" title="${avatar.title} · 게임 ${count}개 · 배지 ${badgeCount}개">
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
          <div class="log-actions">
            <button class="small-button" data-edit="${log.id}">수정</button>
            <button class="small-button delete" data-delete="${log.id}">삭제</button>
          </div>
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

function setEditingMode(log) {
  editingLogId = log.id;
  $("#playerSelect").value = log.memberId;
  $("#genreSelect").value = log.genre;
  $("#gameName").value = log.game;
  $("#companions").value = log.companions;
  $("#editBanner").hidden = false;
  $("#submitLog").textContent = "수정 저장";
  $("#gameName").focus();
}

function clearForm() {
  editingLogId = null;
  $("#gameName").value = "";
  $("#companions").value = "";
  $("#editBanner").hidden = true;
  $("#submitLog").textContent = "기록하기";
}

function switchView(viewName) {
  document.querySelectorAll(".tab, .view").forEach((item) => item.classList.remove("active"));
  document.querySelector(`.tab[data-view="${viewName}"]`).classList.add("active");
  $(`#${viewName}View`).classList.add("active");
}

function selectMember(memberId) {
  selectedMemberId = memberId;
  $("#playerSelect").value = memberId;
  $("#badgeMemberSelect").value = memberId;
  renderQuickPanel();
  renderMembers();
  renderBadges();
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    switchView(button.dataset.view);
  });
});

$("#memberGrid").addEventListener("click", (event) => {
  const card = event.target.closest("[data-member]");
  if (!card) return;
  selectMember(card.dataset.member);
});

$("#memberGrid").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-member]");
  if (!card) return;
  event.preventDefault();
  selectMember(card.dataset.member);
});

$("#quickPanel").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-quick]");
  if (!button || !selectedMemberId) return;

  if (button.dataset.quick === "log") {
    switchView("log");
    $("#playerSelect").value = selectedMemberId;
    $("#gameName").focus();
    return;
  }

  switchView("badges");
  $("#badgeMemberSelect").value = selectedMemberId;
  renderBadges();
});

$("#gameForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = {
    memberId: $("#playerSelect").value,
    game: $("#gameName").value.trim(),
    companions: $("#companions").value.trim(),
    genre: $("#genreSelect").value,
  };

  if (editingLogId) {
    state.logs = state.logs.map((log) =>
      log.id === editingLogId ? { ...log, ...payload } : log
    );
  } else {
    state.logs.push({
      id: crypto.randomUUID(),
      ...payload,
      date: todayText(),
    });
  }

  saveState();
  clearForm();
  render();
});

$("#cancelEdit").addEventListener("click", clearForm);
$("#badgeMemberSelect").addEventListener("change", renderBadges);
$("#playerSelect").addEventListener("change", (event) => {
  selectedMemberId = event.target.value;
  $("#badgeMemberSelect").value = selectedMemberId;
  renderQuickPanel();
  renderMembers();
});

$("#badgeMemberSelect").addEventListener("change", (event) => {
  selectedMemberId = event.target.value;
  $("#playerSelect").value = selectedMemberId;
  renderQuickPanel();
  renderMembers();
  renderBadges();
});

$("#logList").addEventListener("click", (event) => {
  const editButton = event.target.closest("button[data-edit]");
  const deleteButton = event.target.closest("button[data-delete]");

  if (editButton) {
    const log = state.logs.find((item) => item.id === editButton.dataset.edit);
    if (log) setEditingMode(log);
    return;
  }

  if (deleteButton) {
    const ok = confirm("이 기록을 삭제할까요?");
    if (!ok) return;
    state.logs = state.logs.filter((log) => log.id !== deleteButton.dataset.delete);
    if (editingLogId === deleteButton.dataset.delete) clearForm();
    saveState();
    render();
  }
});

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

$("#resetAll").addEventListener("click", () => {
  const ok = confirm("전체 기록과 배지를 모두 지울까요? 이 작업은 되돌릴 수 없어요.");
  if (!ok) return;
  state = structuredClone(initialState);
  saveState();
  clearForm();
  render();
});

render();
