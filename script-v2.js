let currentUser = null;
let studentActivity = [];
let surveyData = [];
let newsComments = [];
let treasureHuntData = [];

const MODUM_INFO = [
    { id: '1모둠', name: '열정 탐정단' },
    { id: '2모둠', name: '그린 가디언즈' },
    { id: '3모둠', name: '넷제로 히어로' },
    { id: '4모둠', name: '데이터 마스터' },
    { id: '5모둠', name: '에코 솔루션' },
    { id: '6모둠', name: '지구 지킴이' },
    { id: '7모둠', name: '그린 라이트' },
    { id: '8모둠', name: '미래 개척자' },
    { id: '9모둠', name: '탄소 해결사' }
];

let uploadedFiles = [];
let chartCaptures = [];
let infographics = [];

let reflectionData = [];
let postSurveyData = [];

// ==========================================
// 구글 시트 연동 설정
// ==========================================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwncrQ37zczl2DlEsBW9oLYqUPKGGsxAnptTKAkohM7ay5B8dpC7D4ujjm9DXdsdKXm_Q/exec";

async function saveToGoogleSheet(type, content) {
    if (!SHEET_URL || SHEET_URL.includes("여기에")) return;

    const userName = currentUser ? currentUser.name : "방문자";
    const userGroup = currentUser ? currentUser.modum : "소속없음";

    const data = {
        group: userGroup,
        user: userName,
        type: type,
        content: content
    };

    try {
        await fetch(SHEET_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(data)
        });
        console.log(`[구글시트 저장] ${type}: ${content}`);
    } catch (error) {
        console.error("구글 시트 저장 실패:", error);
    }
}
// ==========================================


// Celebration Effect
function celebrate() {
    const emojis = ['🌱', '✨', '♻️', '🌍', '💚', '🔋'];
    for (let i = 0; i < 20; i++) {
        const div = document.createElement('div');
        div.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        div.style.position = 'fixed';
        div.style.left = Math.random() * 100 + 'vw';
        div.style.top = '100vh';
        div.style.fontSize = Math.random() * 20 + 20 + 'px';
        div.style.zIndex = '9999';
        div.style.pointerEvents = 'none';
        div.style.transition = 'all ' + (Math.random() * 2 + 2) + 's ease-out';
        document.body.appendChild(div);

        setTimeout(() => {
            div.style.transform = 'translateY(-110vh) rotate(' + (Math.random() * 360) + 'deg)';
            div.style.opacity = '0';
        }, 50);

        setTimeout(() => div.remove(), 4000);
    }
}

// Badge System Data
const BADGE_INFO = {
    1: { id: 'step1', name: '질문 술사', icon: '🔍', color: '#4a90e2', desc: '사전 설문, 뉴스 댓글, 탐구 질문을 모두 완료한 질문의 달인' },
    3: { id: 'step3', name: '데이터 사냥꾼', icon: '🏹', color: '#e67e22', desc: '탐구에 꼭 필요한 데이터를 직접 사냥해 온 수집의 달인' },
    4: { id: 'step4', name: '분석 전문가', icon: '📈', color: '#27ae60', desc: '데이터를 멋진 그래프로 시각화하고 해석해 낸 분석의 달인' },
    5: { id: 'step5', name: '넷제로 아티스트', icon: '🎨', color: '#9b59b6', desc: '복잡한 정보를 한눈에 들어오는 예술로 승화시킨 표현의 달인' },
    6: { id: 'step6', name: '최종 마스터', icon: '🏆', color: '#f1c40f', desc: '모든 탐험 과정을 무사히 마치고 성찰을 완료한 최고의 탐험가' }
};

function handlePostSurveySubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const answers = {};
    formData.forEach((value, key) => {
        answers[key] = value;
    });

    postsData.push({
        studentId: currentUser.id,
        name: currentUser.name,
        answers
    }); // For internal tracking if needed

    postSurveyData.push({ studentId: currentUser.id, name: currentUser.name, answers });

    alert("사후 설문이 완료되었습니다! 이제 성찰 일지를 작성해주세요.");

    // Redirect to journal tab
    switchSubStep(1);
}

function handleJournalSubmit() {
    const qA = document.getElementById('journal-qA').value;
    const qB = document.getElementById('journal-qB').value;
    const qC = document.getElementById('journal-qC').value;

    if (!qA || !qB || !qC) {
        alert("모든 질문에 답을 채워주세요!");
        return;
    }

    reflectionData.push({
        studentId: currentUser.id,
        name: currentUser.name,
        answers: [qA, qB, qC]
    });

    showCertificate();
}

function showCertificate() {
    document.getElementById('cert-id').innerText = currentUser.id;
    document.getElementById('cert-name').innerText = currentUser.name;
    document.getElementById('certificate-modal').style.display = 'block';
}

function exportComprehensiveData() {
    // UTF-8 with BOM for Excel compatibility
    let csvContent = "\uFEFF학번,이름,모둠,사전설문,사후설문,성찰일지,탐구질문,보물찾기제목,뉴스댓글개수\n";

    studentActivity.forEach(s => {
        const preS = surveyData.find(sd => sd.studentId === s.id) ? 'Y' : 'N';
        const postS = postSurveyData.find(sd => sd.studentId === s.id) ? 'Y' : 'N';
        const reflect = reflectionData.find(rd => rd.studentId === s.id) ? 'Y' : 'N';

        // Find individual inquiry (most recent)
        const inquiry = postsData.filter(p => p.studentId === s.id).slice(-1)[0]?.content || "";
        const sanitizedInquiry = inquiry.replace(/,/g, ' ').replace(/\n/g, ' ');

        // Find treasure hunt (joined)
        const treasures = treasureHuntData.filter(t => t.studentId === s.id).map(t => t.title).join(' | ');
        const sanitizedTreasures = treasures.replace(/,/g, ' ').replace(/\n/g, ' ');

        // News comments count
        const newsCount = newsComments.filter(c => c.author.includes(s.id)).length;

        csvContent += `${s.id},${s.name},${s.modum},${preS},${postS},${reflect},${sanitizedInquiry},${sanitizedTreasures},${newsCount}\n`;
    });

    downloadCSV(csvContent, "netzero_comprehensive_master.csv");
}

function exportInquiryLogs() {
    let csvContent = "\uFEFF학번,이름,모둠,시각,탐구질문내용\n";
    postsData.forEach(p => {
        const sanitized = p.content.replace(/,/g, ' ').replace(/\n/g, ' ');
        csvContent += `${p.studentId},${p.studentName},${p.modum},${p.time || ''},${sanitized}\n`;
    });
    downloadCSV(csvContent, "netzero_inquiry_logs.csv");
}

function exportNewsLogs() {
    let csvContent = "\uFEFF활동구분,학번,이름,모둠,시각,내용\n";

    // Treasure Hunt
    treasureHuntData.forEach(t => {
        const sanitized = t.title.replace(/,/g, ' ').replace(/\n/g, ' ');
        csvContent += `뉴스보물찾기,${t.studentId},${t.name},${t.modum},${t.time},${sanitized}\n`;
    });

    // News Comments
    newsComments.forEach(c => {
        const sanitized = c.content.replace(/,/g, ' ').replace(/\n/g, ' ');
        csvContent += `뉴스토론댓글,${c.author.split(' ')[0]},${c.author.split(' ')[1] || ''},N/A,${c.time},${sanitized}\n`;
    });

    downloadCSV(csvContent, "netzero_news_activity_logs.csv");
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function toggleCheck(id) {
    // Visual aid for checklist
    console.log("Checklist item toggled:", id);
}

function handleExhibitionUpload() {
    const title = document.getElementById('exhibit-title').value;
    const checks = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const allChecked = Array.from(checks).every(c => c.checked);

    if (!title) {
        alert("작품 제목을 입력해주세요!");
        return;
    }

    if (!allChecked) {
        alert("필수 요소 체크리스트를 모두 확인해주세요!");
        return;
    }
    if (!currentUser.modum) {
        alert("모둠을 먼저 선택해주세요!");
        showGroupModal();
        return;
    }

    infographics.push({
        id: Date.now(),
        modum: currentUser.modum,
        author: `${currentUser.id} ${currentUser.name}`,
        title: title,
        likes: 0,
        comments: []
    });

    alert("최종 결과물이 전시회에 업로드되었습니다!");
    celebrate();
    loadExhibition();
}

function loadExhibition() {
    setTimeout(() => {
        const gallery = document.getElementById('exhibition-gallery');
        if (!gallery) return;
        gallery.innerHTML = '';

        infographics.forEach(info => {
            gallery.innerHTML += `
            <div class="exhibition-card">
                <div class="exhibition-img">📜</div>
                <div class="exhibition-content">
                    <div class="gallery-author">${info.modum} | ${info.author}</div>
                    <div class="gallery-title">${info.title}</div>
                    <div class="feedback-bar">
                        <button class="feedback-btn" onclick="toggleLike(${info.id}, this)">
                            ❤️ <span class="like-count">${info.likes}</span>
                        </button>
                        <span style="font-size:0.8rem; color:#888;">💬 ${info.comments.length}</span>
                    </div>
                    <div class="comments-section" id="comments-${info.id}">
                        ${info.comments.map(c => `<p>• ${c}</p>`).join('')}
                    </div>
                    <div class="comment-input-box">
                        <input type="text" placeholder="칭찬 한마디..." onkeydown="if(event.key==='Enter') addComment(${info.id}, this)">
                    </div>
                </div>
            </div>
            `;
        });
    }, 100);
}

function toggleLike(id, btn) {
    const info = infographics.find(i => i.id === id);
    if (!info) return;

    if (btn.classList.contains('liked')) {
        info.likes--;
        btn.classList.remove('liked');
    } else {
        info.likes++;
        btn.classList.add('liked');
    }
    btn.querySelector('.like-count').innerText = info.likes;
}

function addComment(id, input) {
    if (!input.value.trim()) return;
    const info = infographics.find(i => i.id === id);
    if (!info) return;

    info.comments.push(input.value);
    const container = document.getElementById(`comments-${id}`);
    const newComment = document.createElement('p');
    newComment.innerText = `• ${input.value}`;
    container.appendChild(newComment);
    input.value = '';
}

function handleFileUpload(input) {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        showLoginModal();
        return;
    }
    if (!currentUser.modum) {
        alert("먼저 모둠을 선택해주세요!");
        showGroupModal();
        return;
    }
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    // Simulate upload
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    uploadedFiles.push({
        modum: currentUser.modum,
        user: `${currentUser.id} ${currentUser.name}`,
        name: file.name,
        time: timeStr
    });

    alert(`'${file.name}' 파일이 ${currentUser.modum} 보물상자에 안전하게 보관되었습니다!`);
    loadStep3Content(); // Refresh UI
}

function loadStep3Content() {
    setTimeout(() => {
        const list = document.getElementById('my-modum-files');
        if (!list) return;
        list.innerHTML = '';

        const myFiles = uploadedFiles.filter(f => f.modum === currentUser.modum);
        if (myFiles.length === 0) {
            list.innerHTML = '<li style="color:#aaa; text-align:center;">아직 업로드된 보물이 없습니다.</li>';
        } else {
            myFiles.forEach(f => {
                list.innerHTML += `
                    <li class="file-item-mini">
                        <span>📄 ${f.name}</span>
                        <span style="color:#888;">${f.time}</span>
                    </li>
                `;
            });
        }
    }, 100);
}

function renderFileTable() {
    const tbody = document.getElementById('admin-files-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    uploadedFiles.forEach(f => {
        tbody.innerHTML += `
            <tr>
                <td>${f.modum}</td>
                <td>${f.user}</td>
                <td>${f.name}</td>
                <td>${f.time}</td>
                <td><button class="btn" style="padding:0.3rem 0.6rem; font-size:0.8rem;">다운로드</button></td>
            </tr>
        `;
    });
}

function loadChartGuide(type) {
    const display = document.getElementById('guide-display');
    const btns = document.querySelectorAll('.guide-btn');
    btns.forEach(b => b.classList.toggle('active', b.getAttribute('onclick').includes(type)));

    const guides = {
        'line': {
            title: "📈 꺾은선 그래프 (Line Chart)",
            use: "시간에 따른 변화 추세를 보여줄 때 가장 좋습니다.",
            ex: "예: 최근 20년간 고촌중 미세먼지 농도 변화"
        },
        'pie': {
            title: "🍰 원 그래프 (Pie Chart)",
            use: "전체에서 각 부분이 차지하는 비율을 비교할 때 좋습니다.",
            ex: "예: 고촌읍 가구별 에너지 사용 비중"
        },
        'bar': {
            title: "📊 막대 그래프 (Bar Chart)",
            use: "여러 항목의 크기를 서로 비교할 때 좋습니다.",
            ex: "예: 모둠별 탄소 발자국 측정 결과"
        }
    };

    const g = guides[type];
    display.innerHTML = `
        <h4>${g.title}</h4>
        <p>${g.use}</p>
        <p style="color:#666; font-size:0.9rem;"><em>${g.ex}</em></p>
    `;
}

function handleChartUpload(event) {
    event.preventDefault();
    const q1 = document.getElementById('viz-q1').value;
    const q2 = document.getElementById('viz-q2').value;
    const q3 = document.getElementById('viz-q3').value;
    const title = document.getElementById('viz-title').value;

    if (!q1 || !q2 || !q3 || !title) {
        alert("모든 질문에 답하고 제목을 입력해주세요!");
        return;
    }
    if (!currentUser.modum) {
        alert("먼저 모둠을 선택해주세요!");
        showGroupModal();
        return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    chartCaptures.push({
        modum: currentUser.modum,
        author: `${currentUser.id} ${currentUser.name}`,
        title: title,
        answers: [q1, q2, q3],
        time: timeStr
    });

    alert("그래프 해석이 등록되었습니다!");
    celebrate();
    loadGallery();
}

function loadGallery() {
    setTimeout(() => {
        const gallery = document.getElementById('viz-gallery');
        if (!gallery) return;
        gallery.innerHTML = '';

        chartCaptures.forEach(c => {
            gallery.innerHTML += `
            <div class="gallery-card">
                <div class="gallery-img">🖼️ 그래프 캡처본</div>
                <div class="gallery-info">
                    <div class="gallery-author">${c.modum} | ${c.author}</div>
                    <div class="gallery-title">${c.title}</div>
                    <div style="font-size:0.8rem; color:#888; margin-top:5px;">
                        Q: ${c.answers[2].slice(0, 15)}...
                    </div>
                </div>
            </div>
            `;
        });
    }, 100);
}

function initSurveyRatings(containerId = null) {
    const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'a1', 'a2', 'a3'];
    questions.forEach(q => {
        const selector = containerId ? `#${containerId} #q-${q}` : `#q-${q}`;
        const container = document.querySelector(selector);
        if (!container) return;
        container.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            let labelText = "";
            if (i === 1) labelText = '<span style="font-size:0.7rem; color:#888; margin-top:4px;">전혀 아니다</span>';
            if (i === 5) labelText = '<span style="font-size:0.7rem; color:#888; margin-top:4px;">매우 그렇다</span>';

            container.innerHTML += `
                <label>
                    <input type="radio" name="${q}" value="${i}" required>
                    ${i}
                    ${labelText}
                </label>
            `;
        }
    });
}

let postsData = [];

let currentBoard = "1모둠";

function loadBoard(modum) {
    currentBoard = modum;

    // Update active tab UI
    const tabs = document.querySelectorAll('.modum-board-tabs .tab-btn');
    tabs.forEach(t => {
        t.classList.toggle('active', t.innerText.includes(modum));
    });

    // Render posts
    const board = document.getElementById('board-content');
    if (!board) return;
    board.innerHTML = '';

    const filtered = postsData.filter(p => p.modum === modum);
    if (filtered.length === 0) {
        board.innerHTML = '<p style="color:#aaa; text-align:center; padding: 2rem;">아직 등록된 질문이 없습니다. 첫 번째 질문을 남겨보세요!</p>';
    } else {
        filtered.forEach(p => {
            board.innerHTML += `
                <div class="post-item individual-post">
                    <div class="post-meta">
                        <span class="post-author-name">${p.studentName}</span>
                        <span class="post-author-id">${p.studentId}</span>
                        <span class="post-time">${p.time || ''}</span>
                    </div>
                    <div class="post-content">${p.content}</div>
                </div>
            `;
        });
    }

    // Check permissions / Visibility for writing
    const groupNeeded = document.getElementById('inquiry-group-needed');
    const writingArea = document.getElementById('inquiry-writing-area');
    const writeSection = document.getElementById('write-section');

    if (groupNeeded && writingArea && writeSection) {
        if (!currentUser || currentUser.role === 'admin') {
            groupNeeded.style.display = 'none';
            writingArea.style.display = 'none';
            writeSection.style.display = 'none';
        } else if (!currentUser.modum) {
            groupNeeded.style.display = 'block';
            writingArea.style.display = 'none';
            writeSection.style.display = 'none';
        } else {
            groupNeeded.style.display = 'none';
            writingArea.style.display = 'block';
            writeSection.style.display = 'block';
        }
    }
}

function submitPost() {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        showLoginModal();
        return;
    }
    if (!currentUser.modum) {
        alert("먼저 모둠을 정해주세요!");
        showGroupModal();
        return;
    }
    const input = document.getElementById('post-input');
    if (!input.value.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    postsData.push({
        modum: currentUser.modum,
        studentId: currentUser.id,
        studentName: currentUser.name,
        author: `${currentUser.id} ${currentUser.name}`,
        content: input.value,
        time: timeStr
    });

    input.value = '';
    loadBoard(currentBoard);
}

// Hook into openStep to trigger initial board load
const originalOpenStep = openStep;
openStep = function (step) {
    originalOpenStep(step);

    if (step === 1 || step === 3 || step === 4 || step === 5 || step === 6) {
        if (step === 1) {
            setTimeout(() => {
                const input = document.getElementById('post-input');
                loadNewsBoard();
                loadBoard("1모둠");
                switchSubStep(1); // Default to first tab
            }, 100);
        } else if (step === 3) {
            loadStep3Content();
        } else if (step === 4) {
            loadGallery();
        } else if (step === 5) {
            loadExhibition();
        } else if (step === 6) {
            setTimeout(() => {
                switchSubStep(1); // Default to first tab (Journal)
            }, 100);
        } else {
            setTimeout(() => loadBoard("1모둠"), 100);
        }
    }
}

function handleLogin(event) {
    event.preventDefault();
    const id = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;

    if (id === "admin1234") {
        currentUser = { id, name, role: 'admin' };
    } else {
        currentUser = { id, name, role: 'student', modum: null, badges: [] };
    }

    updateUIForUser();
    hideLoginModal();

    if (currentUser.role === 'student') {
        alert(`${currentUser.name}님 환영합니다! 상단 메뉴에서 모둠을 정하고 탐험을 시작하세요.`);
    }
}

function handleSurveySubmit(event) {
    event.preventDefault();
    if (!currentUser) {
        alert("관찰 모드입니다. 설문을 제출하려면 먼저 로그인해주세요!");
        showLoginModal();
        return;
    }

    const formData = new FormData(event.target);
    const answers = {};
    formData.forEach((value, key) => {
        answers[key] = value;
    });

    surveyData.push({ studentId: currentUser.id, name: currentUser.name, answers });

    const activity = studentActivity.find(s => s.id === currentUser.id);
    if (activity) activity.survey = true;
    else studentActivity.push({ id: currentUser.id, name: currentUser.name, modum: currentUser.modum, posts: 0, status: "Active", survey: true });

    alert("사전 설문이 제출되었습니다!");
    document.getElementById('survey-modal').style.display = 'none';

    if (document.getElementById('step-modal').style.display === 'block') {
        openStep(1);
    }
}

function startPreSurvey() {
    if (!currentUser) {
        alert("로그인이 필요한 서비스입니다.");
        showLoginModal();
        return;
    }
    initSurveyRatings();
    document.getElementById('survey-modal').style.display = 'block';
}

function updateUIForUser() {
    const guestZone = document.getElementById('guest-zone');
    const userZone = document.getElementById('user-zone');

    if (currentUser) {
        guestZone.style.display = 'none';
        userZone.style.display = 'flex';
        document.getElementById('display-user-name').innerText = currentUser.name;
        document.getElementById('display-user-id').innerText = currentUser.id;

        const modumTag = document.getElementById('display-user-group');
        const setupBtn = document.getElementById('group-setup-btn');

        if (currentUser.role === 'admin') {
            modumTag.innerText = '관리자';
            setupBtn.style.display = 'none';
            document.getElementById('admin-link').style.display = 'inline-block';
        } else {
            if (currentUser.modum) {
                modumTag.innerText = currentUser.modum;
                modumTag.classList.add('active');
                setupBtn.style.display = 'none';
            } else {
                modumTag.innerText = '모둠 미정';
                modumTag.classList.remove('active');
                setupBtn.style.display = 'inline-block';
            }
            document.getElementById('admin-link').style.display = 'none';
        }
    } else {
        guestZone.style.display = 'flex';
        userZone.style.display = 'none';
    }
}

function showLoginModal() {
    document.getElementById('login-overlay').style.display = 'flex';
}

function hideLoginModal() {
    document.getElementById('login-overlay').style.display = 'none';
}

function showGroupModal() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    renderGroupGrid();
    document.getElementById('group-modal').style.display = 'flex';
}

function renderGroupGrid() {
    const container = document.getElementById('group-grid-container');
    if (!container) return;

    container.innerHTML = '';
    MODUM_INFO.forEach(m => {
        const count = studentActivity.filter(s => s.modum === m.id).length;
        const isFull = count >= 4;
        const isDisabled = isFull ? 'disabled' : '';
        const fullClass = isFull ? 'full' : '';

        container.innerHTML += `
            <button class="group-card ${fullClass}" onclick="joinModum('${m.id}')" ${isDisabled}>
                <strong>${m.id}</strong>
                <span>${m.name}</span>
                <span class="member-count">${count}/4명</span>
                ${isFull ? '<small style="color:#e74c3c; font-weight:700;">정원 초과</small>' : ''}
            </button>
        `;
    });
}

function hideGroupModal() {
    document.getElementById('group-modal').style.display = 'none';
}

function joinModum(modumName) {
    if (!currentUser) return;

    const count = studentActivity.filter(s => s.modum === modumName).length;
    if (count >= 4) {
        alert("이 모둠은 이미 정원(4명)이 찼습니다. 다른 모둠을 선택해주세요.");
        return;
    }

    if (confirm(`${modumName}으로 참여하시겠습니까?\n한 번 정하면 직접 변경할 수 없습니다.`)) {
        currentUser.modum = modumName;

        // Update activity list
        let activity = studentActivity.find(s => s.id === currentUser.id);
        if (!activity) {
            activity = { id: currentUser.id, name: currentUser.name, modum: modumName, posts: 0, status: "Active", survey: false };
            studentActivity.push(activity);
        } else {
            activity.modum = modumName;
        }

        updateUIForUser();
        hideGroupModal();
        alert(`${modumName}에 합류하셨습니다! ✨`);

        // Refresh if in a step
        if (document.getElementById('step-modal').style.display === 'block') {
            const modalTitle = document.querySelector('#modal-body h2')?.innerText;
            if (modalTitle?.includes('Step 1')) openStep(1);
            if (modalTitle?.includes('Step 3')) openStep(3);
        }
    }
}

function logout() {
    currentUser = null;
    updateUIForUser();
    // alert("로그아웃 되었습니다.");
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    updateUIForUser();
});

function renderVizTable() {
    const tbody = document.getElementById('admin-viz-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    chartCaptures.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.modum}</td>
                <td>${c.author}</td>
                <td>${c.title}</td>
                <td><small>${c.answers[2].slice(0, 20)}...</small></td>
                <td>${c.time}</td>
            </tr>
        `;
    });
}

function showAdminDashboard() {
    document.querySelector('main').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    renderAdminStats();
    renderStudentTable();
    renderFileTable();
    renderVizTable();
    renderAdminTreasureHuntTable();
    renderAdminNewsCommentsTable();
    renderAdminInquiryTable();
}

function hideAdminDashboard() {
    document.querySelector('main').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function renderAdminStats() {
    const chartBox = document.getElementById('stats-chart');
    chartBox.innerHTML = '';

    // Aggregate by modum
    const modumStats = {};
    studentActivity.forEach(s => {
        modumStats[s.modum] = (modumStats[s.modum] || 0) + s.posts;
    });

    Object.keys(modumStats).forEach(modum => {
        const height = modumStats[modum] * 10;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${height}px`;
        bar.setAttribute('data-label', modum);
        chartBox.appendChild(bar);
    });

    // Survey participation widget
    const surveyChart = document.getElementById('survey-chart');
    if (surveyChart) {
        surveyChart.innerHTML = '';
        const completed = studentActivity.filter(s => s.survey).length;
        const total = studentActivity.length;
        const percent = (completed / total) * 100;

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${percent}%`;
        bar.style.width = '60px';
        bar.style.backgroundColor = 'var(--accent-color)';
        bar.setAttribute('data-label', `참여율: ${Math.round(percent)}%`);
        surveyChart.appendChild(bar);
    }
}

function renderStudentTable() {
    const tbody = document.getElementById('student-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    studentActivity.forEach(s => {
        const newsCount = (treasureHuntData.filter(t => t.studentId === s.id).length) + (newsComments.filter(c => c.author.includes(s.id)).length);
        const inquiryCount = postsData.filter(p => p.studentId === s.id).length;
        const surveyStatus = s.survey ? '<span class="status-badge active" style="background:#e8f5e9; color:#2e7d32;">완료</span>' : '<span class="status-badge" style="background:#f5f5f5; color:#9e9e9e;">미참여</span>';

        const row = `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.modum || '미정'}</td>
                <td>${newsCount}건</td>
                <td>${inquiryCount}건</td>
                <td>${surveyStatus}</td>
                <td>
                    <button class="btn accent" style="padding:0.3rem 0.6rem; font-size:0.8rem; background:#5c6bc0;" onclick="showDraftModal('${s.id}')">✨ AI 초안</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function exportDataToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,학번,이름,모둠,게시글수,설문참여,Q1,Q2,Q3,Q4,Q5,A1,A2,A3,Canva,DataDownload\n";
    studentActivity.forEach(s => {
        const survey = surveyData.find(sd => sd.studentId === s.id);
        const ans = survey ? survey.answers : {};
        csvContent += `${s.id},${s.name},${s.modum},${s.posts},${s.survey ? 'Y' : 'N'},${ans.q1 || ''},${ans.q2 || ''},${ans.q3 || ''},${ans.q4 || ''},${ans.q5 || ''},${ans.a1 || ''},${ans.a2 || ''},${ans.a3 || ''},${ans.canva || ''},${ans.data || ''}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gochon_netzero_comprehensive.csv");
    document.body.appendChild(link);
    link.click();
}

const stepData = {
    1: {
        title: "[Step 1] 넷제로 데이터 탐정의 기초",
        content: `
            <div class="step-details">
                <!-- Step 1 Sub-navigation -->
                <div class="sub-step-tabs">
                    <button class="sub-tab-btn active" onclick="switchSubStep(1)">1. 사전 설문</button>
                    <button class="sub-tab-btn" onclick="switchSubStep(2)">2. 뉴스룸</button>
                    <button class="sub-tab-btn" onclick="switchSubStep(3)">3. 뉴스 보물 찾기</button>
                    <button class="sub-tab-btn" onclick="switchSubStep(4)">4. 탐구 질문 작성</button>
                </div>

                <!-- Sub-step 1: Survey -->
                <div id="sub-step-1" class="sub-step-content active">
                    <div class="notice-card" style="background:#fff4e6; padding:1.5rem; border-radius:15px; margin-bottom:1.5rem; border-left:5px solid #fd7e14;">
                        <h4 style="color:#e67e22; margin-bottom:0.5rem;">🚀 탐험 전 체크인 (사전 설문)</h4>
                        <p>본격적인 넷제로 탐정 활동을 시작하기 전에 여러분의 생각을 들려주세요. <br>이 설문은 프로젝트가 끝난 후 여러분이 얼마나 성장했는지 확인하는 중요한 자료가 됩니다.</p>
                        <button class="btn accent" style="margin-top:1rem; width:100%; height:3rem; font-size:1.1rem;" onclick="startPreSurvey()">사전 설문조사 시작하기</button>
                    </div>
                </div>

                <!-- Sub-step 2: Newsroom -->
                <div id="sub-step-2" class="sub-step-content">
                    <div class="newsroom-container">
                        <div class="newsroom-header">
                            <span class="news-tag">BREAKING NEWS</span>
                            <h3>📰 뉴스룸: 기후 위기 실전 리포트</h3>
                        </div>
                        <div class="newsroom-guide">
                            <blockquote>
                                '탐험가 여러분! 아래 기사를 읽고 우리 지구가 처한 상황을 파악해 봅시다. 기사를 읽은 후, 가장 인상 깊었던 수치나 내용에 대해 아래 댓글창에 자유롭게 의견을 남겨주세요.'
                            </blockquote>
                        </div>
                        
                        <div class="news-card-grid">
                            <a href="https://www.pcccr.go.kr/base/board/read?boardManagementNo=65&boardNo=3017&searchCategory=&page=5&searchType=&searchWord=&menuLevel=3&menuNo=18" target="_blank" class="news-card">
                                <div class="news-card-img">🌡️</div>
                                <div class="news-card-body">
                                    <strong>[보고서] 기후변화에 따른 미래 기온 변화</strong>
                                    <p>기상청 기후변화 리포트: 한반도 기온 상승 추세 분석</p>
                                    <span class="news-link-hint">기사 읽기 ↗</span>
                                </div>
                            </a>
                            <a href="https://www.gimpoeco.com/news/articleView.html?idxno=127" target="_blank" class="news-card">
                                <div class="news-card-img">김포</div>
                                <div class="news-card-body">
                                    <strong>[기사] 김포시 탄소중립 실천 사례</strong>
                                    <p>우리 동네 김포에서는 어떤 노력을 하고 있을까?</p>
                                    <span class="news-link-hint">기사 읽기 ↗</span>
                                </div>
                            </a>
                        </div>

                        <div class="news-discussion">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
                                <h4>💬 실시간 뉴스 토론</h4>
                                <button class="btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="openNewsDiscussionModal()">💻 전체 의견 크게 보기</button>
                            </div>
                            <div id="news-comments-box" class="news-comments-list"></div>
                            <div class="news-comment-input">
                                <textarea id="news-comment-text" placeholder="[학번/이름] 기사 내용 중 ~부분이 놀라웠습니다. 우리 동네 데이터도 확인해보고 싶습니다."></textarea>
                                <button class="btn accent" onclick="addNewsComment()">의견 남기기</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sub-step 3: Treasure Hunt -->
                <div id="sub-step-3" class="sub-step-content">
                    <div class="mission-widget">
                        <div class="widget-icon">🎯</div>
                        <div class="widget-content">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <strong>실습 미션: 뉴스 보물 찾기</strong>
                                <button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="openTreasureHuntModal()">💻 전체 결과 크게 보기</button>
                            </div>
                            <p>지금 빅카인즈에서 [넷제로]를 검색해보고 가장 마음에 드는 기사 제목을 복사해오세요!</p>
                            <div style="display:flex; gap:0.5rem;">
                                <input type="text" id="mission-search-input" placeholder="기사 제목을 여기에 붙여넣으세요." style="flex:1;">
                                <button class="btn accent" style="white-space:nowrap;" onclick="submitTreasureHunt()">저장하기</button>
                            </div>
                        </div>
                    </div>
                    <div style="margin:2rem 0; text-align:center;">
                        <a href="https://www.bigkinds.or.kr" target="_blank" class="btn" style="background:var(--accent-color); width:100%; height:3.5rem; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">[뉴스 빅데이터 빅카인즈 바로가기]</a>
                    </div>

                    <div class="search-guide-container compact-guide">
                        <h4>💡 빅카인즈 검색 팁 (참고용)</h4>
                        <div class="search-guide-grid">
                            <div class="search-guide-item">
                                <span class="search-op">OR</span>
                                <strong>더 넓게 찾기</strong>
                                <code>예: 인공지능 OR 빅데이터</code>
                            </div>
                            <div class="search-guide-item">
                                <span class="search-op">AND</span>
                                <strong>정확히 찾기</strong>
                                <code>예: 김포 AND 넷제로</code>
                            </div>
                            <div class="search-guide-item">
                                <span class="search-op">""</span>
                                <strong>문구 그대로 찾기</strong>
                                <code>예: "4차 산업혁명"</code>
                            </div>
                            <div class="search-guide-item">
                                <span class="search-op">NOT</span>
                                <strong>단어 제외</strong>
                                <code>예: 기후위기 NOT 북극곰</code>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sub-step 4: Planning Board -->
                <div id="sub-step-4" class="sub-step-content">
                    <div id="inquiry-setup-area">
                        <!-- Group Selection Prompt (Shown if modum is null) -->
                        <div id="inquiry-group-needed" class="modum-notice-box" style="display:none;">
                            <h4>🤝 아직 모둠이 정해지지 않았습니다</h4>
                            <p>탐구 질문을 작성하기 위해 먼저 참여할 모둠을 선택해주세요.</p>
                            <button class="btn accent" onclick="showGroupModal()">지금 모둠 선택하기</button>
                        </div>

                        <!-- Wizard & Writing Area (Shown if modum is set) -->
                        <div id="inquiry-writing-area" style="display:none;">
                            <div class="notice-card wizard-container-card">
                                <h3 style="color:#2c3e50; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">🪄 질문 마법사: 나의 탐구 질문 만들기</h3>
                                
                                <div class="wizard-selector">
                                    <button class="wizard-type-btn active" onclick="selectWizardType(1)">
                                        <strong>유형 1: 변화 추적형</strong>
                                        <span>시간에 따른 변화 관찰</span>
                                    </button>
                                    <button class="wizard-type-btn" onclick="selectWizardType(2)">
                                        <strong>유형 2: 상관관계 탐구형</strong>
                                        <span>원인과 결과 분석</span>
                                    </button>
                                    <button class="wizard-type-btn" onclick="selectWizardType(3)">
                                        <strong>유형 3: 비교 분석형</strong>
                                        <span>지역간/대상간 차이 비교</span>
                                    </button>
                                </div>

                                <div id="wizard-input-area" class="wizard-box">
                                    <!-- Wizard Type 1 -->
                                    <div id="wizard-type-1" class="wizard-content active">
                                        <p class="wizard-template">"지난 <input type="text" id="w1-time" placeholder="">년 동안 <input type="text" id="w1-loc" placeholder=""> 지역의 <input type="text" id="w1-var" placeholder="">은 어떻게 변했을까?"</p>
                                    </div>
                                    <!-- Wizard Type 2 -->
                                    <div id="wizard-type-2" class="wizard-content">
                                        <p class="wizard-template">"<input type="text" id="w2-var1" placeholder="">이 높아지면 <input type="text" id="w2-var2" placeholder="">도 함께 높아질까?"</p>
                                    </div>
                                    <!-- Wizard Type 3 -->
                                    <div id="wizard-type-3" class="wizard-content">
                                        <p class="wizard-template">"<input type="text" id="w3-loc1" placeholder=""> 지역과 <input type="text" id="w3-loc2" placeholder=""> 지역 중 어디가 더 <input type="text" id="w3-var" placeholder="">할까?"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="board-container">
                        <div class="board-header">
                            <h4 style="margin:0;">📋 모둠별 탐구 공유 게시판</h4>
                            <p style="margin:0; font-size:0.85rem; color:#888;">작성한 질문이 모둠 게시판에 개별 등록됩니다.</p>
                        </div>
                        <div class="modum-board-tabs" id="inquiry-board-tabs">
                            ${MODUM_INFO.map((m, idx) => `
                                <button class="tab-btn ${idx === 0 ? 'active' : ''}" onclick="loadBoard('${m.id}')">
                                    ${m.id}<br><small>${m.name}</small>
                                </button>
                            `).join('')}
                        </div>
                        <div id="board-content" class="board-posts"></div>
                        
                        <div id="write-section" class="write-box" style="display:none;">
                            <div class="individual-write-input">
                                <textarea id="post-input" placeholder="탐구 질문을 등록해 주세요."></textarea>
                                <button class="btn" onclick="submitPost()">등록하기</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mission-btn-container">
                    <button class="mission-complete-btn" onclick="claimBadge(1)">🔍 미션 완료 & '질문 술사' 배지 받기</button>
                </div>
            </div>
        `
    },
    2: {
        title: "[Step 2. 데이터 탐색] 데이터 사냥터 (Data Hunting)",
        content: `
            <div class="step-details">
                <div class="glass-card" style="padding:1.5rem; margin-bottom:2rem;">
                    <h3>🧭 공공데이터 사냥을 위한 워프 홀</h3>
                    <p>아래 포털로 이동하여 우리 질문에 답이 되어줄 데이터를 찾아보세요.</p>
                </div>
                <div class="data-hunting-grid">
                    <a href="https://data.kma.go.kr" target="_blank" class="hunting-btn">
                        <span class="icon">🌤️</span>
                        <strong>기상청 자료개방포털</strong>
                        <span class="btn">이동하기</span>
                    </a>
                    <a href="https://www.data.go.kr" target="_blank" class="hunting-btn">
                        <span class="icon">📂</span>
                        <strong>공공데이터포털</strong>
                        <span class="btn">이동하기</span>
                    </a>
                    <a href="https://kosis.kr" target="_blank" class="hunting-btn">
                        <span class="icon">📈</span>
                        <strong>국가통계포털(KOSIS)</strong>
                        <span class="btn">이동하기</span>
                    </a>
                </div>
                <div class="mission-guide">
                    <p>🔍 <strong>Tip:</strong> 검색창에 '김포', '고촌', '탄소', '미세먼지' 등을 입력해보세요.</p>
                </div>
            </div>
        `
    },
    3: {
        title: "[Step 3. 데이터 수집] 사냥꾼의 전리품 관리",
        content: `
            <div class="step-details">
                <div class="tutorial-card">
                    <h4>🎬 3분 데이터 사냥 튜토리얼</h4>
                    <div class="tutorial-content">
                        <div class="tutorial-placeholder">▶️ 김포 데이터 검색 가이드 영상</div>
                        <div style="flex:1;">
                            <p><strong>1. 필터 설정</strong>: 지역을 '경기도 김포시'로 설정</p>
                            <p><strong>2. 파일 형식</strong>: 반드시 CSV 또는 Excel 선택</p>
                            <p><strong>3. 다운로드</strong>: '일괄 다운로드' 클릭</p>
                        </div>
                    </div>
                </div>
                
                <h3 style="text-align:center;">💎 디지털 보물 상자</h3>
                <div class="treasure-chest" onclick="document.getElementById('csv-upload').click()">
                    <span class="treasure-icon">📦</span>
                    <p>내려받은 CSV 데이터를 여기에 사냥해오세요!</p>
                    <span class="btn accent">파일 업로드</span>
                    <input type="file" id="csv-upload" style="display:none;" accept=".csv, .xlsx, .xls" onchange="handleFileUpload(this)">
                </div>

                <div class="my-files-section">
                    <h4>우리 모둠 전리품 목록</h4>
                    <ul id="my-modum-files" class="file-list-compact">
                        <!-- Loaded via JS -->
                    </ul>
                </div>

                <div class="mission-btn-container">
                    <button class="mission-complete-btn" onclick="claimBadge(3)">🏹 미션 완료 & '데이터 사냥꾼' 배지 받기</button>
                </div>
            </div>
        `
    },
    4: {
        title: "[Step 4. 분석] 데이터 시각화 스튜디오 (Visualization Studio)",
        content: `
            <div class="step-details">
                <div class="viz-tool-grid">
                    <a href="https://docs.google.com/spreadsheets" target="_blank" class="viz-tool-btn">
                        <span style="font-size:2rem;">📗</span>
                        <div>
                            <strong>구글 스프레드시트</strong>
                            <p style="font-size:0.8rem; color:#888;">실시간 협업 가능</p>
                        </div>
                    </a>
                    <a href="https://www.microsoft.com/ko-kr/microsoft-365/excel" target="_blank" class="viz-tool-btn">
                        <span style="font-size:2rem;">📘</span>
                        <div>
                            <strong>엑셀 온라인</strong>
                            <p style="font-size:0.8rem; color:#888;">강력한 데이터 분석</p>
                        </div>
                    </a>
                </div>

                <div class="viz-guide-box">
                    <h3>🔍 어떤 그래프를 선택할까요?</h3>
                    <div class="guide-selector">
                        <button class="guide-btn active" onclick="loadChartGuide('line')">변화 추세</button>
                        <button class="guide-btn" onclick="loadChartGuide('pie')">비중 비교</button>
                        <button class="guide-btn" onclick="loadChartGuide('bar')">크기 비교</button>
                    </div>
                    <div id="guide-display" class="mission-guide">
                        <h4>📈 꺾은선 그래프 (Line Chart)</h4>
                        <p>시간에 따른 변화 추세를 보여줄 때 가장 좋습니다.</p>
                        <p style="color:#666; font-size:0.9rem;"><em>예: 최근 20년간 고촌중 미세먼지 농도 변화</em></p>
                    </div>
                </div>

                <div class="interpretation-form">
                    <h3>💬 데이터 해석 질문지</h3>
                    <form onsubmit="handleChartUpload(event)">
                        <div class="interpretation-item">
                            <label>0. 그래프 제목</label>
                            <input type="text" id="viz-title" placeholder="우리 모둠이 그린 그래프의 이름을 지어주세요.">
                        </div>
                        <div class="interpretation-item">
                            <label>1. 그래프의 선이 위로 향하나요, 아래로 향하나요? (추세 확인)</label>
                            <input type="text" id="viz-q1" placeholder="예: 2015년부터 급격히 위로 향하고 있습니다.">
                        </div>
                        <div class="interpretation-item">
                            <label>2. 가장 값이 높았던 해와 낮았던 해는 언제인가요? (극값 확인)</label>
                            <input type="text" id="viz-q2" placeholder="예: 최고 2023년, 최저 2014년">
                        </div>
                        <div class="interpretation-item">
                            <label>3. 이 결과가 우리 모둠의 탐구 질문과 어떤 관련이 있나요? (의미 파악)</label>
                            <input type="text" id="viz-q3" placeholder="예: 탄소 배출량이 늘어나면서 기온도 함께 상승함을 알 수 있습니다.">
                        </div>
                        <button type="submit" class="btn login-submit" style="background:#a0522d;">해석 등록 & 갤러리 업로드</button>
                    </form>
                </div>

                <h3>🖼️ 고촌중 데이터 시각화 갤러리</h3>
                <div id="viz-gallery" class="chart-gallery">
                    <!-- Loaded via JS -->
                </div>

                <div class="mission-btn-container">
                    <button class="mission-complete-btn" onclick="claimBadge(4)">📈 미션 완료 & '분석 전문가' 배지 받기</button>
                </div>
            </div>
        `
    },
    5: {
        title: "[Step 5. 지식 공유] 넷제로 디자인 센터 (Net-Zero Design Center)",
        content: `
            <div class="step-details">
                <div class="design-tool-grid">
                    <a href="https://www.canva.com" target="_blank" class="canva-btn">
                        <span>🎨 Canva 바로가기</span>
                    </a>
                    <a href="https://www.canva.com/templates/s/net-zero/" target="_blank" class="canva-btn template-btn">
                        <span>📐 넷제로 포스터 템플릿</span>
                    </a>
                </div>

                <div class="checklist-widget">
                    <h3>✅ 인포그래픽 필수 요소 체크리스트</h3>
                    <label class="checklist-item">
                        <input type="checkbox" onclick="toggleCheck('q1')">
                        우리 모둠의 탐구 질문이 명확히 드러나는가?
                    </label>
                    <label class="checklist-item">
                        <input type="checkbox" onclick="toggleCheck('q2')">
                        직접 그린 데이터 그래프가 포함되어 있는가?
                    </label>
                    <label class="checklist-item">
                        <input type="checkbox" onclick="toggleCheck('q3')">
                        데이터의 출처(기상청 등)를 밝혔는가?
                    </label>
                    <label class="checklist-item">
                        <input type="checkbox" onclick="toggleCheck('q4')">
                        넷제로 실천을 위한 우리만의 제안이 들어있는가?
                    </label>
                </div>

                <div class="interpretation-form" style="background:#f3f0ff; border-color:#ded8f5;">
                    <h3>📤 최종 결과물 업로드</h3>
                    <div class="interpretation-item">
                        <label>작품 제목</label>
                        <input type="text" id="exhibit-title" placeholder="작품의 멋진 제목을 지어주세요.">
                    </div>
                    <button class="btn login-submit" style="background:#6c5ce7;" onclick="handleExhibitionUpload()">전시회에 작품 올리기</button>
                </div>

                <h3 style="margin-top:3rem;">🌟 고촌중 넷제로 온라인 전시회</h3>
                <div id="exhibition-gallery" class="infographic-gallery">
                    <!-- Loaded via JS -->
                </div>

                <div class="mission-btn-container">
                    <button class="mission-complete-btn" onclick="claimBadge(5)">🎨 미션 완료 & '넷제로 아티스트' 배지 받기</button>
                </div>
            </div>
        `
    },
    6: {
        title: "[Step 6. 성찰/평가] 탐험 성찰 센터 (Reflection Center)",
        content: `
            <div class="step-details">
                <div class="sub-step-tabs">
                    <button class="sub-tab-btn active" onclick="switchSubStep(1)">1. 데이터 탐험가의 디지털 일지</button>
                    <button class="sub-tab-btn" onclick="switchSubStep(2)">2. 사후 설문</button>
                </div>

                <!-- Sub-step 1: Digital Journal -->
                <div id="sub-step-1" class="sub-step-content active">
                    <div class="journal-box">
                        <div class="notice-card" style="background:#f1f8ff; border-left:5px solid #0366d6; margin-bottom:1.5rem;">
                            <h4 style="color:#0366d6;">📔 나의 탐험 기록하기</h4>
                            <p>전체 과정을 돌아보며 가장 기억에 남는 순간을 기록해 보세요. <br>일지를 저장하면 나만의 수료증이 발급됩니다.</p>
                        </div>
                        <div class="journal-item">
                            <label>[질문 A] 이번 프로젝트에서 내가 가장 '데이터 사냥꾼' 같았던 순간은?</label>
                            <textarea id="journal-qA" placeholder="데이터를 찾거나 분석하며 보람을 느꼈던 순간을 적어주세요."></textarea>
                        </div>
                        <div class="journal-item">
                            <label>[질문 B] 데이터를 분석하며 새롭게 알게 된 우리 동네(고촌)의 모습은?</label>
                            <textarea id="journal-qB" placeholder="그래프를 통해 발견한 새로운 사실을 적어주세요."></textarea>
                        </div>
                        <div class="journal-item">
                            <label>[질문 C] 다음에 또 데이터를 다룬다면 어떤 주제를 파헤쳐보고 싶은가?</label>
                            <textarea id="journal-qC" placeholder="더 궁금해진 넷제로 관련 주제를 적어주세요."></textarea>
                        </div>
                        <button class="btn login-submit" style="background:var(--primary-dark);" onclick="handleJournalSubmit()">일지 저장 & 수료증 발급</button>
                    </div>
                </div>

                <!-- Sub-step 2: Post Survey -->
                <div id="sub-step-2" class="sub-step-content">
                    <div class="notice-card" style="background:#f6ffed; border-left:5px solid #52c41a; margin-bottom:1.5rem;">
                        <h4 style="color:#389e0d;">🏁 데이터 탐험 피날레: 사후 설문</h4>
                        <p>프로젝트 전후의 놀라운 변화를 확인하기 위해 마지막 설문에 참여해주세요. <br>여러분의 소중한 답변이 우리 학교 환경 교육을 더 멋지게 만듭니다.</p>
                    </div>
                    <form onsubmit="handlePostSurveySubmit(event)">
                        <div id="post-survey-questions-tab">
                            <!-- Injected via Script -->
                        </div>
                        <button type="submit" class="btn login-submit" style="background:#52c41a; margin-top:1.5rem;">사후 설문 제출 완료</button>
                    </form>
                    
                    <div class="mission-btn-container">
                        <button class="mission-complete-btn" onclick="claimBadge(6)">🏆 최종 미션 완료 & '마스터' 배지 받기</button>
                    </div>
                </div>
            </div>
        `
    }
};

function openStep(step) {
    const modal = document.getElementById('step-modal');
    const modalBody = document.getElementById('modal-body');
    const data = stepData[step];

    if (data) {
        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>${data.title}</h2>
                <button onclick="closeModal()" class="btn" style="padding:0.5rem 1rem;">닫기</button>
            </div>
            <div class="content">${data.content}</div>
        `;
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent scrolling
    }
}

function closeModal() {
    const modal = document.getElementById('step-modal');
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('step-modal');
    if (event.target == modal) {
        closeModal();
    }
}
function loadNewsBoard() {
    const box = document.getElementById('news-comments-box');
    const modalBox = document.getElementById('news-comments-modal-list');

    const renderComments = (target) => {
        if (!target) return;
        target.innerHTML = '';
        newsComments.forEach(c => {
            target.innerHTML += `
                <div class="news-comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${c.author}</span>
                        <span class="comment-time">${c.time}</span>
                    </div>
                    <div class="comment-body">${c.content}</div>
                </div>
            `;
        });
        // Scroll to bottom
        target.scrollTop = target.scrollHeight;
    };

    renderComments(box);
    renderComments(modalBox);
}

function openNewsDiscussionModal() {
    document.getElementById('news-discussion-modal').style.display = 'block';
    loadNewsBoard();
}

function closeNewsDiscussionModal() {
    document.getElementById('news-discussion-modal').style.display = 'none';
}

function switchSubStep(subId) {
    // Hide all sub-steps
    document.querySelectorAll('.sub-step-content').forEach(c => c.classList.remove('active'));
    // Show selected sub-step
    const targetContent = document.getElementById(`sub-step-${subId}`);
    if (targetContent) targetContent.classList.add('active');

    // Update tab buttons
    document.querySelectorAll('.sub-tab-btn').forEach((btn, index) => {
        btn.classList.toggle('active', (index + 1) === subId);
    });

    // Reset scroll of the modal overlay
    const modalOverlay = document.getElementById('step-modal');
    if (modalOverlay) modalOverlay.scrollTop = 0;

    // Specific loads
    const currentStepTitle = document.querySelector('#modal-body h2')?.innerText;

    if (currentStepTitle?.includes('Step 1')) {
        if (subId === 2) loadNewsBoard();
        if (subId === 4) loadBoard("1모둠");
    }

    if (currentStepTitle?.includes('Step 6')) {
        if (subId === 2) loadPostSurveyTab();
    }
}

function loadPostSurveyTab() {
    const container = document.getElementById('post-survey-questions-tab');
    if (!container) return;

    // Check if already completed
    const alreadyDone = postSurveyData.find(s => s.studentId === currentUser.id);
    if (alreadyDone) {
        container.innerHTML = '<div style="text-align:center; padding:2rem; color:#52c41a;">✅ 이미 사후 설문에 참여하셨습니다. 참여해주셔서 감사합니다!</div>';
        return;
    }

    const preForm = document.getElementById('pre-survey-form');
    if (preForm) {
        const sections = preForm.querySelectorAll('.survey-section');
        container.innerHTML = '';
        sections.forEach(s => {
            const clone = s.cloneNode(true);
            container.appendChild(clone);
        });
        // Initialize ratings for the post survey
        initSurveyRatings('post-survey-questions-tab');
    }
}

function addNewsComment() {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        showLoginModal();
        return;
    }
    const input = document.getElementById('news-comment-text');
    if (!input.value.trim()) {
        alert("의견을 입력해주세요!");
        return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    newsComments.push({
        author: `${currentUser.id} ${currentUser.name}`,
        content: input.value,
        time: timeStr
    });

    input.value = '';
    loadNewsBoard();

    alert("의견이 등록되었습니다!");
}

function submitPost() {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        showLoginModal();
        return;
    }
    if (!currentUser.modum) {
        alert("먼저 모둠을 정해주세요!");
        showGroupModal();
        return;
    }
    const input = document.getElementById('post-input');
    if (!input.value.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    postsData.push({
        modum: currentUser.modum,
        studentId: currentUser.id,
        studentName: currentUser.name,
        author: `${currentUser.id} ${currentUser.name}`, // Backward compatibility
        content: input.value,
        time: timeStr
    });

    input.value = '';
    loadBoard(currentBoard);
}

let activeWizardType = 1;

function selectWizardType(type) {
    activeWizardType = type;
    document.querySelectorAll('.wizard-type-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', (idx + 1) === type);
    });
    document.querySelectorAll('.wizard-content').forEach((block, idx) => {
        block.classList.toggle('active', (idx + 1) === type);
    });
}

function generateWizardPost() {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        showLoginModal();
        return;
    }
    if (!currentUser.modum) {
        alert("모둠을 먼저 선택해주세요!");
        showGroupModal();
        return;
    }

    let finalQuestion = "";
    if (activeWizardType === 1) {
        const time = document.getElementById('w1-time').value || "10";
        const loc = document.getElementById('w1-loc').value || "김포시";
        const variable = document.getElementById('w1-var').value || "여름철 최고 기온";
        finalQuestion = `[유형 1: 변화 추적형] 지난 ${time}년 동안 ${loc} 지역의 ${variable}은 어떻게 변했을까?`;
    } else if (activeWizardType === 2) {
        const v1 = document.getElementById('w2-var1').value || "김포의 미세먼지 농도";
        const v2 = document.getElementById('w2-var2').value || "전력 사용량";
        finalQuestion = `[유형 2: 상관관계 탐구형] ${v1}이 높아지면 ${v2}도 함께 높아질까?`;
    } else {
        const l1 = document.getElementById('w3-loc1').value || "고촌읍";
        const l2 = document.getElementById('w3-loc2').value || "운양동";
        const v = document.getElementById('w3-var').value || "여름에 시원";
        finalQuestion = `[유형 3: 비교 분석형] ${l1} 지역과 ${l2} 지역 중 어디가 더 ${v}할까?`;
    }

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    postsData.push({
        modum: currentUser.modum,
        studentId: currentUser.id,
        studentName: currentUser.name,
        author: `${currentUser.id} ${currentUser.name}`,
        content: finalQuestion,
        time: timeStr
    });

    loadBoard(currentUser.modum);
    alert("나만의 탐구 질문이 게시판에 등록되었습니다! ✨");
}

function submitTreasureHunt() {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        showLoginModal();
        return;
    }
    const input = document.getElementById('mission-search-input');
    if (!input.value.trim()) {
        alert("기사 제목을 입력해주세요!");
        return;
    }

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    treasureHuntData.push({
        modum: currentUser.modum,
        studentId: currentUser.id,
        name: currentUser.name,
        title: input.value,
        time: timeStr
    });

    input.value = '';
    alert("보물을 찾으셨군요! 저장되었습니다.");
}

function openTreasureHuntModal() {
    document.getElementById('treasure-hunt-modal').style.display = 'block';
    renderTreasureHuntBoard();
}

function closeTreasureHuntModal() {
    document.getElementById('treasure-hunt-modal').style.display = 'none';
}

function renderTreasureHuntBoard() {
    const target = document.getElementById('treasure-hunt-modal-list');
    if (!target) return;
    target.innerHTML = '';

    if (treasureHuntData.length === 0) {
        target.innerHTML = '<p style="text-align:center; color:#999; padding:2rem;">아직 보물을 찾은 탐험가가 없습니다. 첫 번째 보물을 찾아보세요!</p>';
        return;
    }

    treasureHuntData.forEach(item => {
        target.innerHTML += `
            <div class="news-comment-item">
                <div class="comment-header">
                    <span class="comment-author">${item.modum} ${item.name}</span>
                    <span class="comment-time">${item.time}</span>
                </div>
                <div class="comment-body" style="font-weight:700; color:var(--accent-color);">💎 ${item.title}</div>
            </div>
        `;
    });
    target.scrollTop = target.scrollHeight;
}

function renderAdminTreasureHuntTable() {
    const tbody = document.getElementById('admin-treasure-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    treasureHuntData.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.modum}</td>
                <td>${item.name}(${item.studentId})</td>
                <td>${item.title}</td>
                <td>${item.time}</td>
            </tr>
        `;
    });
}

function renderAdminNewsCommentsTable() {
    const tbody = document.getElementById('admin-news-comments-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    newsComments.forEach(c => {
        const studentInfo = c.author.split(' '); // Assuming format "id name"
        tbody.innerHTML += `
            <tr>
                <td>${currentUser && currentUser.id === studentInfo[0] ? currentUser.modum : 'N/A'}</td>
                <td>${c.author}</td>
                <td>${c.content}</td>
                <td>${c.time}</td>
            </tr>
        `;
    });
}

function renderAdminInquiryTable() {
    const tbody = document.getElementById('admin-inquiry-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    postsData.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.modum}</td>
                <td><strong>${p.studentName || 'N/A'}</strong><br><small>${p.studentId || ''}</small></td>
                <td>${p.content}</td>
                <td>${p.time || ''}</td>
            </tr>
        `;
    });
}
function showDraftModal(studentId) {
    const student = studentActivity.find(s => s.id === studentId);
    if (!student) return;

    const modal = document.getElementById('draft-modal');
    const infoBox = document.getElementById('draft-student-info');
    const textBox = document.getElementById('ai-draft-text');
    const byteCount = document.getElementById('byte-count');

    infoBox.innerText = `대상: ${student.name} (${student.id}) | 소속: ${student.modum || '미정'}`;

    // Generate AI Draft
    const draft = generateDetailedAbility(studentId);
    textBox.value = draft;

    // Update byte count
    const bytes = new TextEncoder().encode(draft).length;
    byteCount.innerText = `${bytes} / 1000 Bytes`;

    modal.style.display = 'flex';
}

function hideDraftModal() {
    document.getElementById('draft-modal').style.display = 'none';
}

function copyDraft() {
    const text = document.getElementById('ai-draft-text');
    text.select();
    document.execCommand('copy');
    alert('세특 초안이 클립보드에 복사되었습니다.');
}

function generateDetailedAbility(studentId) {
    const student = studentActivity.find(s => s.id === studentId);
    const inquiries = postsData.filter(p => p.studentId === studentId);
    const treasures = treasureHuntData.filter(t => t.studentId === studentId);
    const viz = chartCaptures.find(c => c.author.includes(studentId));
    const comments = newsComments.filter(c => c.author.includes(studentId));

    let draft = `${student.name} 학생은 '넷제로 데이터 랩' 프로젝트에 참여하여 `;

    // 1. Inquiry Aspect
    if (inquiries.length > 0) {
        const topics = inquiries.map(p => p.content.split(']')[1] || p.content).join(', ');
        draft += `환경 문제에 대한 깊이 있는 통찰을 바탕으로 "${topics.slice(0, 50)}..." 등 구체적이고 체계적인 탐구 질문을 설정함. `;
    } else {
        draft += `탄소 중립 및 지역 환경 이슈에 관심을 가지고 탐구 계획을 수립함. `;
    }

    // 2. Data Aspect (News/Research)
    if (treasures.length > 0) {
        draft += `공공데이터 포털과 뉴스룸을 활용하여 관련 근거 데이터를 수집하는 능력이 탁월하며, 특히 '${treasures[0].title.slice(0, 20)}' 등 핵심 정보를 발굴하여 탐구의 객관성을 확보함. `;
    }

    // 3. Visualization/Analysis
    if (viz) {
        draft += `수집된 데이터를 바탕으로 '${viz.title}' 그래프를 직접 시각화하였으며, '${viz.answers[2].slice(0, 40)}'와 같이 데이터 간의 관계를 논리적으로 해석하여 결론을 도출하는 역량을 보여줌. `;
    }

    // 4. Communication/Reflection
    if (comments.length > 0) {
        draft += `학급 뉴스 게시판에서 타인의 의견에 경청하고 '${comments[0].content.slice(0, 30)}'와 같은 창의적인 대안을 제시하며 공동체 역량을 발휘함. `;
    }

    draft += `종합적으로 볼 때, 데이터를 기반으로 환경 문제를 정의하고 해결 대안을 모색하는 데이터 리터러시 및 생태 시민 의식이 매우 뛰어난 학생임.`;

    // Ensure it doesn't exceed 1000 bytes by cutting if necessary (rare given the template)
    if (new TextEncoder().encode(draft).length > 1000) {
        draft = draft.slice(0, 450) + "...";
    }

    return draft;
}
function claimBadge(step) {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        showLoginModal();
        return;
    }

    if (currentUser.badges.includes(`step${step}`)) {
        alert("이미 획득한 배지입니다! 마이페이지에서 확인해 보세요.");
        return;
    }

    // Condition Check
    let isValid = false;
    let message = "";

    if (step === 1) {
        const hasSurvey = surveyData.find(s => s.studentId === currentUser.id);
        const hasComment = newsComments.find(c => c.author.includes(currentUser.id));
        const hasPost = postsData.find(p => p.studentId === currentUser.id);
        if (hasSurvey && hasComment && hasPost) isValid = true;
        else message = "사전 설문 참여, 뉴스 댓글 작성, 모둠 탐구 질문 등록을 모두 완료해야 합니다.";
    } else if (step === 3) {
        const hasFile = uploadedFiles.find(f => f.user.includes(currentUser.id));
        if (hasFile) isValid = true;
        else message = "탐구 질문에 맞는 공공데이터(CSV) 파일을 업로드해야 합니다.";
    } else if (step === 4) {
        const hasViz = chartCaptures.find(c => c.author.includes(currentUser.id));
        if (hasViz) isValid = true;
        else message = "데이터 시각화 스튜디오에서 분석 결과를 등록해야 합니다.";
    } else if (step === 5) {
        const hasArt = infographics.find(i => i.author.includes(currentUser.id));
        if (hasArt) isValid = true;
        else message = "캔바를 활용한 인포그래픽 포스터를 전시회에 업로드해야 합니다.";
    } else if (step === 6) {
        const hasPostSurvey = postSurveyData.find(s => s.studentId === currentUser.id);
        const hasJournal = reflectionData.find(r => r.studentId === currentUser.id);
        if (hasPostSurvey && hasJournal) isValid = true;
        else message = "사후 설문과 성찰 일지 작성을 모두 완료해야 합니다.";
    }

    if (!isValid) {
        alert(`아직 미션이 완료되지 않았습니다!\n\n조건: ${message}`);
        return;
    }

    // Award Badge
    currentUser.badges.push(`step${step}`);
    showBadgePopup(step);

    // Check for All Badges
    if (Object.keys(BADGE_INFO).every(s => currentUser.badges.includes(`step${s}`))) {
        setTimeout(triggerFireworks, 1500);
    }
}

function showBadgePopup(step) {
    const badge = BADGE_INFO[step];
    const popup = document.createElement('div');
    popup.className = 'badge-popup-overlay';
    popup.innerHTML = `
        <div class="badge-popup-card">
            <div class="badge-popup-icon" style="background: ${badge.color}">${badge.icon}</div>
            <h2>축하합니다!</h2>
            <p><strong>[${badge.name}]</strong> 배지를 획득했습니다.</p>
            <span class="badge-desc">${badge.desc}</span>
            <button class="btn accent" onclick="this.parentElement.parentElement.remove()">확인</button>
        </div>
    `;
    document.body.appendChild(popup);
}

function triggerFireworks() {
    const container = document.createElement('div');
    container.className = 'fireworks-container';
    document.body.appendChild(container);

    // Simple firework emojis
    for (let i = 0; i < 40; i++) {
        const fw = document.createElement('div');
        fw.className = 'firework-particle';
        fw.innerText = ['✨', '💥', '⭐', '🎊', '🎉'][Math.floor(Math.random() * 5)];
        fw.style.left = Math.random() * 100 + 'vw';
        fw.style.top = '100vh';
        fw.style.animationDuration = (Math.random() * 2 + 1) + 's';
        fw.style.fontSize = (Math.random() * 20 + 20) + 'px';
        container.appendChild(fw);
    }

    const masterPopup = document.createElement('div');
    masterPopup.className = 'master-popup';
    masterPopup.innerHTML = `
        <div class="master-card">
            <h1>🏆 최종 마스터 등극! 🏆</h1>
            <p>모든 데이터 탐험 미션을 완수하셨습니다.<br>당신은 진정한 넷제로 데이터 전문가입니다!</p>
            <button class="btn gold" onclick="location.reload()">활동 종료</button>
        </div>
    `;
    setTimeout(() => document.body.appendChild(masterPopup), 2000);

    setTimeout(() => container.remove(), 5000);
}

function openMyPage() {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        showLoginModal();
        return;
    }
    const modal = document.getElementById('my-page-modal');
    const container = document.getElementById('my-badges-grid');
    container.innerHTML = '';

    Object.keys(BADGE_INFO).forEach(step => {
        const badge = BADGE_INFO[step];
        const isEarned = currentUser.badges.includes(`step${step}`);
        container.innerHTML += `
            <div class="my-badge-item ${isEarned ? 'earned' : 'locked'}">
                <div class="my-badge-icon" style="background: ${isEarned ? badge.color : '#eee'}">
                    ${isEarned ? badge.icon : '❓'}
                </div>
                <div class="my-badge-name">${badge.name}</div>
                <div class="my-badge-step">Step ${step}</div>
            </div>
        `;
    });

    modal.style.display = 'flex';
}

function hideMyPage() {
    document.getElementById('my-page-modal').style.display = 'none';
}
