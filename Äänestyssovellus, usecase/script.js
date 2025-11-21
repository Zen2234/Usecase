const POLLS_KEY = 'polls';
let polls = JSON.parse(localStorage.getItem(POLLS_KEY)) || [];

let currentUser = null;
let selectedPoll = null;

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const userInfo = document.getElementById('user-info');
const pollList = document.getElementById('poll-list');
const pollDetailSection = document.getElementById('poll-detail-section');
const pollTitle = document.getElementById('poll-title');
const pollOptions = document.getElementById('poll-options');
const adminSection = document.getElementById('admin-section');

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('back-btn').addEventListener('click', showPollList);
document.getElementById('create-poll-btn').addEventListener('click', createPoll);

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    if (!username || !password) {
        alert("Täytä käyttäjänimi ja salasana.");
        return;
    }

    let user = users.find(u => u.username === username);

    if (!user) {
        user = { username, password, role };
        users.push(user);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } else {
        if (user.password !== password) {
            alert("Väärä salasana.");
            return;
        }
    }
    currentUser = user;

    userInfo.textContent = `${user.username} (${user.role === 'admin' ? 'Ylläpitäjä' : 'Käyttäjä'})`;

    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    if (user.role === 'admin') adminSection.classList.remove('hidden');
    else adminSection.classList.add('hidden');

    renderPolls();
}

function logout() {
    currentUser = null;
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
}

function renderPolls() {
    pollList.innerHTML = '';
    polls.forEach((poll, index) => {
        const li = document.createElement('li');
        li.textContent = poll.title;
        li.addEventListener('click', () => showPollDetail(index));
        if (currentUser.role === 'admin') {
            const delBtn = document.createElement('button');
            delBtn.textContent = "Poista";
            delBtn.style.marginLeft = "10px";
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePoll(index);
            });
            li.appendChild(delBtn);
        }
        pollList.appendChild(li);
    });
}

function showPollDetail(index) {
    selectedPoll = polls[index];
    pollDetailSection.classList.remove('hidden');
    document.getElementById('poll-list-section').classList.add('hidden');
    pollTitle.textContent = selectedPoll.title;

    pollOptions.innerHTML = '';
    selectedPoll.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.classList.add('poll-option');
        div.innerHTML = `
            <strong>${opt.text}</strong> - ${opt.votes} ääntä 
            ${currentUser.role === 'user' ? `<button onclick="vote(${index}, ${i})">Äänestä</button>` : ''}
        `;
        pollOptions.appendChild(div);
    });
}

function showPollList() {
    pollDetailSection.classList.add('hidden');
    document.getElementById('poll-list-section').classList.remove('hidden');
    renderPolls();
}

function vote(pollIndex, optionIndex) {
    const poll = polls[pollIndex];

    if (poll.votedUsers && poll.votedUsers.includes(currentUser.username)) {
        alert("Olet jo äänestänyt tässä äänestyksessä.");
        return;
    }

    if (!poll.votedUsers) {
        poll.votedUsers = [];
    }

    poll.options[optionIndex].votes++;
    poll.votedUsers.push(currentUser.username);

    savePolls();
    showPollDetail(pollIndex);
}


function createPoll() {
    const title = document.getElementById('new-poll-title').value.trim();
    const optionsText = document.getElementById('new-poll-options').value.trim();

    if (!title || !optionsText) {
        alert("Täytä otsikko ja vaihtoehdot.");
        return;
    }

    const options = optionsText.split('\n').map(opt => ({
        text: opt.trim(),
        votes: 0
    }));

    polls.push({ title, options, votedUsers: [] });
    savePolls();

    document.getElementById('new-poll-title').value = '';
    document.getElementById('new-poll-options').value = '';

    renderPolls();
}


function deletePoll(index) {
    if (confirm("Haluatko varmasti poistaa tämän äänestyksen?")) {
        polls.splice(index, 1);
        savePolls();
        renderPolls();
    }
}

function savePolls() {
    localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
}


