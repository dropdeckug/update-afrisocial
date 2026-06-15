const BASE_URL = "https://afrisocial-backend-dev-production.up.railway.app";
const headers = {
    "Content-Type": "application/json"
};

async function loadLeaderboard() {
    const loading = document.getElementById('loader');
    const container = document.getElementById('leaderboard');
    
    loading.classList.add('show');
    container.innerHTML = '';
    
    try {
        const res = await fetch(`${BASE_URL}/leaderboard?limit=100`, {
            method: "GET",
            headers
        });
        
        const data = await res.json();
        loading.classList.remove('show');
        
        if (!data.success || !data.leaderboard) {
            container.innerHTML = '<p class="error">Failed to load leaderboard</p>';
            return;
        }
        
        const sorted = data.leaderboard.sort((a, b) => b.referrals - a.referrals);
        renderLeaderboard(sorted);
    } catch (err) {
        console.error("Failed to load leaderboard:", err);
        loading.classList.remove('show');
        container.innerHTML = '<p class="error">Failed to load. Try again.</p>';
    }
}

function renderLeaderboard(list) {
    const container = document.getElementById('leaderboard');
    
    if (list.length === 0) {
        container.innerHTML = '<p class="error">No referrals yet</p>';
        return;
    }
    
    list.forEach((user, i) => {
        const row = document.createElement('div');
        row.className = 'entry';
        row.onclick = () => location.href = `profile.html?userId=${user.user_id}`;
        
        row.innerHTML = `
          <div class="user-profile">
            <div class="profile">
              <img src="${user.avatar}" alt="${user.username}">
            </div>
            <div class="user-info">
              <span class="username">${user.username}</span>
              <span class="referral-count">${user.referrals} Referrals</span>
            </div>
          </div>
          <div class="earning">₦${Number(user.earnings || 0).toLocaleString()}</div>
        `;
        
        container.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', loadLeaderboard);