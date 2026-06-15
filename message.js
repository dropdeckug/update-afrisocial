// ==================== CONFIGURATION ====================
const baseUrl = "https://afrisocial-backend.onrender.com";
const token = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId");

// Redirect if not logged in
if (!token || !currentUserId) {
  window.location.href = "/login.html";
}

// ==================== DOM ELEMENTS ====================
const chatList = document.getElementById("chatList");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");
const activeStoriesScroll = document.getElementById("storiesScroll");
const searchContainer = document.getElementById("searchContainer");
const messageSearchInput = document.getElementById("messageSearchInput");
const closeMessageSearch = document.getElementById("closeMessageSearch");
const searchMessagesBtn = document.getElementById("searchMessagesBtn");
const newChatBtn = document.getElementById("newChatBtn");
const backBtn = document.getElementById("backBtn");
const pillTabs = document.querySelectorAll(".pill-tab");
const newChatModal = document.getElementById("newChatModal");
const createGroupModal = document.getElementById("createGroupModal");
const userSearchInput = document.getElementById("userSearchInput");
const userSearchResults = document.getElementById("userSearchResults");
const closeNewChatModal = document.getElementById("closeNewChatModal");
const closeGroupModal = document.getElementById("closeGroupModal");
const groupNameInput = document.getElementById("groupNameInput");
const groupMembersSearch = document.getElementById("groupMembersSearch");
const groupMembersResults = document.getElementById("groupMembersResults");
const selectedMembersDiv = document.getElementById("selectedMembers");
const createGroupBtn = document.getElementById("createGroupBtn");
const chatThreadModal = document.getElementById("chatThreadModal");
const threadBackBtn = document.getElementById("threadBackBtn");
const messagesList = document.getElementById("messagesList");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const attachFileBtn = document.getElementById("attachFileBtn");
const fileInput = document.getElementById("fileInput");
const threadMenuBtn = document.getElementById("threadMenuBtn");
const threadMenuModal = document.getElementById("threadMenuModal");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const viewProfileBtn = document.getElementById("viewProfileBtn");
const archiveChatBtn = document.getElementById("archiveChatBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const blockUserBtn = document.getElementById("blockUserBtn");
const deleteMsgModal = document.getElementById("deleteMsgModal");
const confirmDeleteMsg = document.getElementById("confirmDeleteMsg");
const cancelDeleteMsg = document.getElementById("cancelDeleteMsg");
const messageBadge = document.getElementById("messageBadge");
const emptyStartBtn = document.getElementById("emptyStartBtn");
const unarchiveModal = document.getElementById("unarchiveModal");
const confirmUnarchive = document.getElementById("confirmUnarchive");
const cancelUnarchive = document.getElementById("cancelUnarchive");
const groupInfoModal = document.getElementById("groupInfoModal");
const closeGroupInfoModal = document.getElementById("closeGroupInfoModal");
const groupMembersList = document.getElementById("groupMembersList");
const leaveGroupBtn = document.getElementById("leaveGroupBtn");
const deleteGroupBtn = document.getElementById("deleteGroupBtn");
const chatsBadge = document.getElementById("chatsBadge");
const groupsBadge = document.getElementById("groupsBadge");
const archivedBadge = document.getElementById("archivedBadge");

// ==================== STATE ====================
let currentTab = "chats";
let currentChatUser = null;
let currentChatId = null;
let currentChatType = "direct";
let currentGroupId = null;
let messagePollingInterval = null;
let typingTimeout = null;
let isTyping = false;
let messageToDelete = null;
let currentPage = 1;
let hasMoreMessages = true;
let isLoadingMessages = false;
let selectedMembers = [];
let archiveTarget = null;

// ==================== HELPER FUNCTIONS ====================
function getFlagEmoji(code) {
  if (!code) return "";
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(date).toLocaleDateString();
}

function formatMessageTime(date) {
  const msgDate = new Date(date);
  const now = new Date();
  if (msgDate.toDateString() === now.toDateString()) {
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return msgDate.toLocaleDateString();
}

function showToast(message) {
  let toast = document.getElementById("messageToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "messageToast";
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: #111;
      color: #fff;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 14px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.25s;
      pointer-events: none;
      white-space: nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function scrollToBottom() {
  const container = document.querySelector(".chat-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// ==================== API CALLS ====================
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API call failed");
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ==================== LOAD CHATS BASED ON TAB ====================
async function loadChats() {
  loadingState.style.display = "flex";
  emptyState.style.display = "none";
  
  try {
    let endpoint = "/api/messages/chats";
    let badgeElement = chatsBadge;
    
    if (currentTab === "groups") {
      endpoint = "/api/messages/groups";
      badgeElement = groupsBadge;
    } else if (currentTab === "archived") {
      endpoint = "/api/messages/archived";
      badgeElement = archivedBadge;
    }
    
    const data = await apiCall(endpoint);
    let chats = [];
    
    if (currentTab === "groups") {
      chats = data.groups || [];
    } else if (currentTab === "archived") {
      chats = data.archivedChats || [];
    } else {
      chats = data.chats || [];
    }
    
    loadingState.style.display = "none";
    
    await updateTabBadges();
    
    if (chats.length === 0) {
      if (currentTab === "chats") {
        emptyTitle.textContent = "No messages yet";
        emptyMessage.textContent = "Start a conversation with someone!";
        emptyStartBtn.style.display = "block";
        emptyStartBtn.textContent = "Start Chat";
      } else if (currentTab === "groups") {
        emptyTitle.textContent = "No groups yet";
        emptyMessage.textContent = "Create or join a group to start chatting!";
        emptyStartBtn.style.display = "block";
        emptyStartBtn.textContent = "Create Group";
      } else {
        emptyTitle.textContent = "No archived chats";
        emptyMessage.textContent = "Archived chats will appear here";
        emptyStartBtn.style.display = "none";
      }
      emptyState.style.display = "flex";
      chatList.innerHTML = "";
      return;
    }
    
    emptyState.style.display = "none";
    renderChats(chats);
    
    if (currentTab === "chats") {
      const unreadCount = chats.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      if (unreadCount > 0) {
        messageBadge.textContent = unreadCount > 99 ? "99+" : unreadCount;
        messageBadge.style.display = "flex";
      } else {
        messageBadge.style.display = "none";
      }
    }
    
  } catch (error) {
    console.error("Load chats error:", error);
    loadingState.style.display = "none";
    showToast("Failed to load messages");
  }
}

async function updateTabBadges() {
  try {
    const chatsData = await apiCall("/api/messages/chats");
    const chats = chatsData.chats || [];
    const unreadCount = chats.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    chatsBadge.textContent = unreadCount;
    chatsBadge.classList.toggle("hidden", unreadCount === 0);
    
    const groupsData = await apiCall("/api/messages/groups");
    const groups = groupsData.groups || [];
    const groupsCount = groups.length;
    groupsBadge.textContent = groupsCount;
    groupsBadge.classList.toggle("hidden", groupsCount === 0);
    
    const archivedData = await apiCall("/api/messages/archived");
    const archived = archivedData.archivedChats || [];
    const archivedCount = archived.length;
    archivedBadge.textContent = archivedCount;
    archivedBadge.classList.toggle("hidden", archivedCount === 0);
    
  } catch (error) {
    console.error("Update badges error:", error);
  }
}

function renderChats(chats) {
  chatList.innerHTML = "";
  
  chats.forEach(chat => {
    const isGroup = chat.isGroup || chat.type === "group";
    const isArchived = currentTab === "archived" || chat.isArchived;
    const user = isGroup ? chat : (chat.participant || chat.user || chat);
    const lastMessage = chat.lastMessage || {};
    const isUnread = chat.unreadCount > 0 && !isArchived;
    
    const div = document.createElement("div");
    div.className = `chat-item ${isUnread ? "unread" : ""} ${isArchived ? "archived" : ""} ${isGroup ? "group" : ""}`;
    div.dataset.userId = isGroup ? chat._id : user._id;
    div.dataset.chatId = chat._id;
    div.dataset.chatType = isGroup ? "group" : "direct";
    
    let avatarHtml = "";
    if (isGroup) {
      const groupInitials = (chat.name || "Group").substring(0, 2).toUpperCase();
      avatarHtml = `<div class="group-avatar">${groupInitials}</div>`;
    } else {
      avatarHtml = `
        <img src="${user.profilePicture || '/uploads/images/africa.png'}" 
             onerror="this.src='/uploads/images/africa.png'" />
        <div class="status-dot ${user.isOnline ? 'online' : 'offline'}"></div>
      `;
    }
    
    div.innerHTML = `
      <div class="chat-avatar">
        ${avatarHtml}
      </div>
      <div class="chat-info">
        <div class="chat-name-row">
          <span class="chat-name">
            ${isGroup ? (chat.name || "Group") : (user.fullName || user.username)} 
            ${!isGroup && user.isVerified ? '✓' : ''}
            ${isGroup ? `<span class="member-count">• ${chat.memberCount || 0} members</span>` : ''}
          </span>
          <span class="chat-time">${lastMessage.createdAt ? timeAgo(lastMessage.createdAt) : ''}</span>
        </div>
        <div class="chat-last-msg">
          ${lastMessage.isMedia ? '📎 ' : ''}${lastMessage.text || (isGroup ? 'No messages yet' : 'Start a conversation')}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        ${isUnread ? `<div class="unread-badge">${chat.unreadCount > 99 ? '99+' : chat.unreadCount}</div>` : ''}
        ${isArchived ? `
          <button class="unarchive-btn" data-chatid="${chat._id}" data-chattype="${isGroup ? 'group' : 'direct'}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
    
    div.addEventListener("click", (e) => {
      if (!e.target.closest(".unarchive-btn")) {
        if (isGroup) {
          openGroupThread(chat);
        } else {
          openChatThread(user, chat._id);
        }
      }
    });
    
    const unarchiveBtn = div.querySelector(".unarchive-btn");
    if (unarchiveBtn) {
      unarchiveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        archiveTarget = { chatId: unarchiveBtn.dataset.chatid, type: unarchiveBtn.dataset.chattype };
        unarchiveModal.style.display = "flex";
      });
    }
    
    chatList.appendChild(div);
  });
}

// ==================== ARCHIVE FUNCTIONS ====================
async function archiveChat(chatId, type) {
  try {
    await apiCall(`/api/messages/${chatId}/archive`, { method: "POST" });
    showToast("Chat archived");
    await loadChats();
    await updateTabBadges();
  } catch (error) {
    showToast("Failed to archive chat");
  }
}

async function unarchiveChat(chatId, type) {
  try {
    await apiCall(`/api/messages/${chatId}/unarchive`, { method: "POST" });
    showToast("Chat unarchived");
    unarchiveModal.style.display = "none";
    await loadChats();
    await updateTabBadges();
  } catch (error) {
    showToast("Failed to unarchive chat");
  }
}

// ==================== GROUP FUNCTIONS ====================
async function createGroup() {
  const name = groupNameInput.value.trim();
  if (!name) {
    showToast("Please enter a group name");
    return;
  }
  
  if (selectedMembers.length === 0) {
    showToast("Please add at least one member");
    return;
  }
  
  createGroupBtn.disabled = true;
  createGroupBtn.textContent = "Creating...";
  
  try {
    const response = await apiCall("/api/messages/groups", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        members: selectedMembers
      })
    });
    
    showToast("Group created successfully!");
    createGroupModal.style.display = "none";
    groupNameInput.value = "";
    selectedMembers = [];
    selectedMembersDiv.innerHTML = "";
    await loadChats();
    
  } catch (error) {
    showToast("Failed to create group");
  }
  
  createGroupBtn.disabled = false;
  createGroupBtn.textContent = "Create Group";
}

async function openGroupThread(group) {
  currentChatType = "group";
  currentGroupId = group._id;
  currentChatUser = {
    _id: group._id,
    fullName: group.name,
    username: group.name,
    profilePicture: null,
    isGroup: true
  };
  
  document.getElementById("threadAvatar").src = "/uploads/images/africa.png";
  document.getElementById("threadUserName").innerHTML = `${group.name} • ${group.memberCount || 0} members`;
  document.getElementById("threadUserStatus").textContent = "Group";
  document.getElementById("threadUserStatus").style.color = "#6B7280";
  
  chatThreadModal.style.display = "flex";
  document.body.style.overflow = "hidden";
  
  messagesList.innerHTML = "";
  currentPage = 1;
  hasMoreMessages = true;
  
  await loadGroupMessages(true);
  startMessagePolling();
  messageInput.focus();
}

async function loadGroupMessages(reset = true) {
  if (isLoadingMessages) return;
  if (!hasMoreMessages && !reset) return;
  
  isLoadingMessages = true;
  
  try {
    const data = await apiCall(`/api/messages/groups/${currentGroupId}/messages?page=${currentPage}&limit=30`);
    const messages = data.messages || [];
    
    if (reset) {
      messagesList.innerHTML = "";
      currentPage = 1;
    }
    
    if (messages.length === 0 && reset) {
      messagesList.innerHTML = '<div class="empty-state" style="padding:40px;"><p>No messages yet. Send a message!</p></div>';
      isLoadingMessages = false;
      return;
    }
    
    hasMoreMessages = messages.length === 30;
    const sortedMessages = [...messages].reverse();
    
    if (!reset) {
      sortedMessages.forEach(msg => appendGroupMessageToThread(msg));
    } else {
      messagesList.innerHTML = "";
      sortedMessages.forEach(msg => appendGroupMessageToThread(msg));
      scrollToBottom();
    }
    
    isLoadingMessages = false;
    
  } catch (error) {
    console.error("Load group messages error:", error);
    isLoadingMessages = false;
    showToast("Failed to load messages");
  }
}

function appendGroupMessageToThread(message) {
  const isSent = message.sender === currentUserId;
  const hasMedia = message.media && message.media.trim() !== "";
  const sender = message.senderDetails || {};
  
  const div = document.createElement("div");
  div.className = `message-bubble ${isSent ? 'sent' : 'received'}`;
  div.dataset.messageId = message._id;
  
  let senderHtml = "";
  if (!isSent) {
    senderHtml = `<div style="font-size: 10px; font-weight: 600; color: #9CA3AF; margin-bottom: 4px;">${escapeHtml(sender.fullName || sender.username)}</div>`;
  }
  
  let mediaHtml = "";
  if (hasMedia) {
    const mediaUrl = message.media.startsWith("http") ? message.media : `${baseUrl}${message.media}`;
    if (message.media.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      mediaHtml = `<img src="${mediaUrl}" class="message-media" onclick="window.open('${mediaUrl}')" />`;
    } else if (message.media.match(/\.(mp4|webm|ogg)$/i)) {
      mediaHtml = `<video src="${mediaUrl}" class="message-media" controls preload="metadata"></video>`;
    }
  }
  
  div.innerHTML = `
    <div class="message-content">
      ${senderHtml}
      ${mediaHtml}
      <div class="message-text">${escapeHtml(message.text || '')}</div>
      <div class="message-time">${formatMessageTime(message.createdAt)}</div>
    </div>
  `;
  
  messagesList.appendChild(div);
}

async function sendGroupMessage() {
  const text = messageInput.value.trim();
  if (!text && !fileInput.files[0]) return;
  
  sendMessageBtn.disabled = true;
  
  try {
    let response;
    
    if (fileInput.files[0]) {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("media", fileInput.files[0]);
      
      response = await fetch(`${baseUrl}/api/messages/groups/${currentGroupId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
    } else {
      response = await fetch(`${baseUrl}/api/messages/groups/${currentGroupId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });
    }
    
    if (!response.ok) throw new Error("Send failed");
    
    const newMessage = await response.json();
    appendGroupMessageToThread(newMessage);
    scrollToBottom();
    
    messageInput.value = "";
    fileInput.value = "";
    
  } catch (error) {
    console.error("Send group message error:", error);
    showToast("Failed to send message");
  }
  
  sendMessageBtn.disabled = false;
  messageInput.focus();
}

// ==================== DIRECT MESSAGE FUNCTIONS ====================
async function openChatThread(user, chatId) {
  currentChatType = "direct";
  currentChatUser = user;
  currentChatId = chatId;
  currentGroupId = null;
  
  document.getElementById("threadAvatar").src = user.profilePicture || '/uploads/images/africa.png';
  document.getElementById("threadUserName").innerHTML = `${escapeHtml(user.fullName || user.username)} ${user.isVerified ? '✓' : ''} ${getFlagEmoji(user.country)}`;
  document.getElementById("threadUserStatus").textContent = user.isOnline ? "online" : "offline";
  document.getElementById("threadUserStatus").style.color = user.isOnline ? "#22C55E" : "#9CA3AF";
  
  chatThreadModal.style.display = "flex";
  document.body.style.overflow = "hidden";
  
  messagesList.innerHTML = "";
  currentPage = 1;
  hasMoreMessages = true;
  
  await loadMessages(true);
  await markMessagesAsRead(user._id);
  startMessagePolling();
  messageInput.focus();
}

async function loadMessages(reset = true) {
  if (isLoadingMessages) return;
  if (!hasMoreMessages && !reset) return;
  
  isLoadingMessages = true;
  
  try {
    const data = await apiCall(`/api/messages/${currentChatUser._id}?page=${currentPage}&limit=30`);
    const messages = data.messages || [];
    
    if (reset) {
      messagesList.innerHTML = "";
      currentPage = 1;
    }
    
    if (messages.length === 0 && reset) {
      messagesList.innerHTML = '<div class="empty-state" style="padding:40px;"><p>No messages yet. Send a message!</p></div>';
      isLoadingMessages = false;
      return;
    }
    
    hasMoreMessages = messages.length === 30;
    const sortedMessages = [...messages].reverse();
    
    if (!reset) {
      sortedMessages.forEach(msg => appendMessageToThread(msg));
    } else {
      messagesList.innerHTML = "";
      sortedMessages.forEach(msg => appendMessageToThread(msg));
      scrollToBottom();
    }
    
    isLoadingMessages = false;
    
  } catch (error) {
    console.error("Load messages error:", error);
    isLoadingMessages = false;
    showToast("Failed to load messages");
  }
}

function appendMessageToThread(message) {
  const isSent = message.sender === currentUserId;
  const hasMedia = message.media && message.media.trim() !== "";
  
  const div = document.createElement("div");
  div.className = `message-bubble ${isSent ? 'sent' : 'received'}`;
  div.dataset.messageId = message._id;
  
  let mediaHtml = "";
  if (hasMedia) {
    const mediaUrl = message.media.startsWith("http") ? message.media : `${baseUrl}${message.media}`;
    if (message.media.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      mediaHtml = `<img src="${mediaUrl}" class="message-media" onclick="window.open('${mediaUrl}')" />`;
    } else if (message.media.match(/\.(mp4|webm|ogg)$/i)) {
      mediaHtml = `<video src="${mediaUrl}" class="message-media" controls preload="metadata"></video>`;
    }
  }
  
  div.innerHTML = `
    <div class="message-content">
      ${mediaHtml}
      <div class="message-text">${escapeHtml(message.text || '')}</div>
      <div class="message-time">${formatMessageTime(message.createdAt)}</div>
    </div>
  `;
  
  if (isSent) {
    div.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      messageToDelete = message._id;
      deleteMsgModal.style.display = "flex";
    });
  }
  
  messagesList.appendChild(div);
}

async function sendDirectMessage() {
  const text = messageInput.value.trim();
  if (!text && !fileInput.files[0]) return;
  
  sendMessageBtn.disabled = true;
  
  try {
    let response;
    
    if (fileInput.files[0]) {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("media", fileInput.files[0]);
      
      response = await fetch(`${baseUrl}/api/messages/${currentChatUser._id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
    } else {
      response = await fetch(`${baseUrl}/api/messages/${currentChatUser._id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });
    }
    
    if (!response.ok) throw new Error("Send failed");
    
    const newMessage = await response.json();
    appendMessageToThread(newMessage);
    scrollToBottom();
    
    messageInput.value = "";
    fileInput.value = "";
    await loadChats();
    
  } catch (error) {
    console.error("Send message error:", error);
    showToast("Failed to send message");
  }
  
  sendMessageBtn.disabled = false;
  messageInput.focus();
}

function sendMessage() {
  if (currentChatType === "group") {
    sendGroupMessage();
  } else {
    sendDirectMessage();
  }
}

async function markMessagesAsRead(userId) {
  try {
    await apiCall(`/api/messages/${userId}/read`, { method: "POST" });
    await loadChats();
    await updateTabBadges();
  } catch (error) {
    console.error("Mark read error:", error);
  }
}

// ==================== TYPING INDICATOR ====================
async function sendTypingIndicator() {
  if (!currentChatUser || currentChatType === "group") return;
  
  if (!isTyping) {
    isTyping = true;
    try {
      await fetch(`${baseUrl}/api/messages/${currentChatUser._id}/typing`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (error) {}
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
  }, 2000);
}

// ==================== CHAT ACTIONS ====================
async function clearChat() {
  if (!confirm("Clear all messages in this chat? This cannot be undone.")) return;
  
  try {
    if (currentChatType === "group") {
      await apiCall(`/api/messages/groups/${currentGroupId}/clear`, { method: "DELETE" });
    } else {
      await apiCall(`/api/messages/${currentChatUser._id}/clear`, { method: "DELETE" });
    }
    messagesList.innerHTML = '<div class="empty-state" style="padding:40px;"><p>Chat cleared</p></div>';
    showToast("Chat cleared");
    threadMenuModal.style.display = "none";
    await loadChats();
  } catch (error) {
    showToast("Failed to clear chat");
  }
}

async function blockUser() {
  if (!confirm(`Block ${currentChatUser.fullName || currentChatUser.username}? You won't receive messages from them.`)) return;
  
  try {
    await apiCall(`/api/users/block/${currentChatUser._id}`, { method: "POST" });
    showToast("User blocked");
    closeChatThread();
    threadMenuModal.style.display = "none";
    await loadChats();
  } catch (error) {
    showToast("Failed to block user");
  }
}

async function deleteMessage() {
  if (!messageToDelete) return;
  
  try {
    await apiCall(`/api/messages/${messageToDelete}`, { method: "DELETE" });
    const messageElement = document.querySelector(`.message-bubble[data-message-id="${messageToDelete}"]`);
    if (messageElement) messageElement.remove();
    showToast("Message deleted");
  } catch (error) {
    showToast("Failed to delete message");
  }
  
  messageToDelete = null;
  deleteMsgModal.style.display = "none";
}

// ==================== POLLING ====================
function startMessagePolling() {
  if (messagePollingInterval) clearInterval(messagePollingInterval);
  
  messagePollingInterval = setInterval(async () => {
    if (chatThreadModal.style.display === "flex") {
      if (currentChatType === "group") {
        await loadGroupMessages(false);
      } else if (currentChatUser) {
        await loadMessages(false);
      }
    }
  }, 3000);
}

function stopMessagePolling() {
  if (messagePollingInterval) {
    clearInterval(messagePollingInterval);
    messagePollingInterval = null;
  }
}

function closeChatThread() {
  chatThreadModal.style.display = "none";
  document.body.style.overflow = "";
  stopMessagePolling();
  currentChatUser = null;
  currentChatId = null;
  currentGroupId = null;
}

// ==================== SEARCH USERS ====================
async function searchUsers(query) {
  if (!query.trim()) {
    userSearchResults.innerHTML = "";
    return;
  }
  
  try {
    const data = await apiCall(`/api/users/search?q=${encodeURIComponent(query)}`);
    const users = data.users || [];
    
    if (users.length === 0) {
      userSearchResults.innerHTML = '<p style="text-align:center;color:#9CA3AF;">No users found</p>';
      return;
    }
    
    userSearchResults.innerHTML = users.map(user => `
      <div class="search-result-item" data-userid="${user._id}" data-username="${user.username}" data-fullname="${user.fullName}" data-avatar="${user.profilePicture || ''}">
        <img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" />
        <div class="search-result-info">
          <strong>${escapeHtml(user.fullName || user.username)} ${user.isVerified ? '✓' : ''}</strong>
          <span>@${user.username} ${getFlagEmoji(user.country)}</span>
        </div>
      </div>
    `).join("");
    
    document.querySelectorAll(".search-result-item").forEach(el => {
      el.addEventListener("click", () => {
        const user = {
          _id: el.dataset.userid,
          username: el.dataset.username,
          fullName: el.dataset.fullname,
          profilePicture: el.dataset.avatar
        };
        newChatModal.style.display = "none";
        openChatThread(user, null);
      });
    });
    
  } catch (error) {
    console.error("Search users error:", error);
    userSearchResults.innerHTML = '<p style="text-align:center;color:#EF4444;">Search failed</p>';
  }
}

// ==================== SEARCH GROUP MEMBERS ====================
async function searchGroupMembers(query) {
  if (!query.trim()) {
    groupMembersResults.innerHTML = "";
    return;
  }
  
  try {
    const data = await apiCall(`/api/users/search?q=${encodeURIComponent(query)}`);
    const users = data.users || [];
    
    const filteredUsers = users.filter(u => u._id !== currentUserId && !selectedMembers.includes(u._id));
    
    if (filteredUsers.length === 0) {
      groupMembersResults.innerHTML = '<p style="text-align:center;color:#9CA3AF;">No users found</p>';
      return;
    }
    
    groupMembersResults.innerHTML = filteredUsers.map(user => `
      <div class="search-result-item" data-userid="${user._id}" data-username="${user.username}" data-fullname="${user.fullName}" data-avatar="${user.profilePicture || ''}">
        <img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" />
        <div class="search-result-info">
          <strong>${escapeHtml(user.fullName || user.username)}</strong>
          <span>@${user.username}</span>
        </div>
        <button class="add-member-btn">Add</button>
      </div>
    `).join("");
    
    document.querySelectorAll(".add-member-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const item = btn.closest(".search-result-item");
        const userId = item.dataset.userid;
        const userName = item.dataset.fullname || item.dataset.username;
        
        if (!selectedMembers.includes(userId)) {
          selectedMembers.push(userId);
          const tag = document.createElement("div");
          tag.className = "selected-member-tag";
          tag.innerHTML = `${escapeHtml(userName)} <button data-userid="${userId}">&times;</button>`;
          selectedMembersDiv.appendChild(tag);
          
          tag.querySelector("button").addEventListener("click", () => {
            selectedMembers = selectedMembers.filter(id => id !== userId);
            tag.remove();
          });
        }
        
        item.remove();
      });
    });
    
  } catch (error) {
    console.error("Search group members error:", error);
  }
}

// ==================== SEARCH MESSAGES ====================
async function searchMessages(query) {
  if (!query.trim()) {
    await loadChats();
    return;
  }
  
  loadingState.style.display = "flex";
  
  try {
    const data = await apiCall(`/api/messages/search?q=${encodeURIComponent(query)}`);
    const results = data.results || [];
    
    loadingState.style.display = "none";
    
    if (results.length === 0) {
      chatList.innerHTML = `<div class="empty-state" style="display:flex;"><p>No results found for "${escapeHtml(query)}"</p></div>`;
      return;
    }
    
    chatList.innerHTML = "";
    results.forEach(result => {
      const div = document.createElement("div");
      div.className = "chat-item";
      div.innerHTML = `
        <div class="chat-avatar">
          <img src="${result.profilePicture || '/uploads/images/africa.png'}" 
               onerror="this.src='/uploads/images/africa.png'" />
        </div>
        <div class="chat-info">
          <div class="chat-name-row">
            <span class="chat-name">${escapeHtml(result.fullName || result.username)}</span>
          </div>
          <div class="chat-last-msg">${escapeHtml(result.email || result.username)}</div>
        </div>
      `;
      div.addEventListener("click", () => openChatThread(result, null));
      chatList.appendChild(div);
    });
    
  } catch (error) {
    loadingState.style.display = "none";
    showToast("Search failed");
  }
}

// ==================== ACTIVE STORIES ====================
async function loadActiveStories() {
  try {
    const data = await apiCall("/api/users/active");
    const users = data.users || [];
    
    if (users.length === 0) {
      document.querySelector(".active-stories").style.display = "none";
      return;
    }
    
    activeStoriesScroll.innerHTML = users.slice(0, 10).map(user => `
      <div class="story-avatar ${user.isOnline ? 'online' : ''}" data-userid="${user._id}">
        <img class="story-avatar-img" src="${user.profilePicture || '/uploads/images/africa.png'}" 
             onerror="this.src='/uploads/images/africa.png'" />
        <span>${escapeHtml(user.username || user.fullName)}</span>
      </div>
    `).join("");
    
    document.querySelectorAll(".story-avatar").forEach(el => {
      el.addEventListener("click", () => {
        const userId = el.dataset.userid;
        const user = users.find(u => u._id === userId);
        if (user) openChatThread(user, null);
      });
    });
    
  } catch (error) {
    console.error("Load active stories error:", error);
  }
}

// ==================== EVENT LISTENERS ====================
backBtn.addEventListener("click", () => {
  window.location.href = "/feed.html";
});

searchMessagesBtn.addEventListener("click", () => {
  searchContainer.style.display = searchContainer.style.display === "none" ? "block" : "none";
  if (searchContainer.style.display === "block") {
    messageSearchInput.focus();
  } else {
    messageSearchInput.value = "";
    loadChats();
  }
});

closeMessageSearch.addEventListener("click", () => {
  searchContainer.style.display = "none";
  messageSearchInput.value = "";
  loadChats();
});

messageSearchInput.addEventListener("input", (e) => {
  searchMessages(e.target.value);
});

newChatBtn.addEventListener("click", () => {
  const rect = newChatBtn.getBoundingClientRect();
  const menu = document.createElement("div");
  menu.className = "action-menu";
  menu.innerHTML = `
    <div class="action-menu-item" id="newDirectChat">💬 New Chat</div>
    <div class="action-menu-item" id="newGroupChat">👥 New Group</div>
  `;
  menu.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 5}px;
    right: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 1001;
    overflow: hidden;
    width: 160px;
  `;
  document.body.appendChild(menu);
  
  document.getElementById("newDirectChat").addEventListener("click", () => {
    newChatModal.style.display = "flex";
    menu.remove();
  });
  
  document.getElementById("newGroupChat").addEventListener("click", () => {
    createGroupModal.style.display = "flex";
    menu.remove();
  });
  
  setTimeout(() => {
    document.addEventListener("click", () => menu.remove(), { once: true });
  }, 0);
});

closeNewChatModal.addEventListener("click", () => {
  newChatModal.style.display = "none";
  userSearchInput.value = "";
  userSearchResults.innerHTML = "";
});

closeGroupModal.addEventListener("click", () => {
  createGroupModal.style.display = "none";
  groupNameInput.value = "";
  selectedMembers = [];
  selectedMembersDiv.innerHTML = "";
  groupMembersResults.innerHTML = "";
});

userSearchInput.addEventListener("input", (e) => {
  searchUsers(e.target.value);
});

groupMembersSearch.addEventListener("input", (e) => {
  searchGroupMembers(e.target.value);
});

createGroupBtn.addEventListener("click", createGroup);

pillTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    pillTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    loadChats();
  });
});

threadBackBtn.addEventListener("click", closeChatThread);

sendMessageBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener("input", () => {
  if (currentChatType !== "group") {
    sendTypingIndicator();
  }
});

attachFileBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) {
    sendMessage();
  }
});

threadMenuBtn.addEventListener("click", () => {
  threadMenuModal.style.display = "flex";
});

closeMenuBtn.addEventListener("click", () => {
  threadMenuModal.style.display = "none";
});

viewProfileBtn.addEventListener("click", () => {
  if (currentChatUser && currentChatType !== "group") {
    window.location.href = `/profile.html?userId=${currentChatUser._id}`;
  }
  threadMenuModal.style.display = "none";
});

archiveChatBtn.addEventListener("click", () => {
  if (currentChatId) {
    archiveChat(currentChatId, currentChatType);
    threadMenuModal.style.display = "none";
    closeChatThread();
  }
});

clearChatBtn.addEventListener("click", clearChat);

blockUserBtn.addEventListener("click", () => {
  if (currentChatType !== "group") {
    blockUser();
  }
});

confirmDeleteMsg.addEventListener("click", deleteMessage);

cancelDeleteMsg.addEventListener("click", () => {
  deleteMsgModal.style.display = "none";
  messageToDelete = null;
});

confirmUnarchive.addEventListener("click", () => {
  if (archiveTarget) {
    unarchiveChat(archiveTarget.chatId, archiveTarget.type);
  }
});

cancelUnarchive.addEventListener("click", () => {
  unarchiveModal.style.display = "none";
  archiveTarget = null;
});

emptyStartBtn.addEventListener("click", () => {
  if (currentTab === "groups") {
    createGroupModal.style.display = "flex";
  } else {
    newChatModal.style.display = "flex";
  }
});

closeGroupInfoModal.addEventListener("click", () => {
  groupInfoModal.style.display = "none";
});

leaveGroupBtn.addEventListener("click", () => {
  if (currentGroupId) {
    if (confirm("Leave this group?")) {
      apiCall(`/api/messages/groups/${currentGroupId}/leave`, { method: "POST" })
        .then(() => {
          showToast("Left group");
          closeChatThread();
          groupInfoModal.style.display = "none";
          loadChats();
        })
        .catch(() => showToast("Failed to leave group"));
    }
  }
});

deleteGroupBtn.addEventListener("click", () => {
  if (currentGroupId) {
    if (confirm("Delete this group permanently? This cannot be undone.")) {
      apiCall(`/api/messages/groups/${currentGroupId}`, { method: "DELETE" })
        .then(() => {
          showToast("Group deleted");
          closeChatThread();
          groupInfoModal.style.display = "none";
          loadChats();
        })
        .catch(() => showToast("Failed to delete group"));
    }
  }
});

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === newChatModal) newChatModal.style.display = "none";
  if (e.target === createGroupModal) createGroupModal.style.display = "none";
  if (e.target === threadMenuModal) threadMenuModal.style.display = "none";
  if (e.target === deleteMsgModal) deleteMsgModal.style.display = "none";
  if (e.target === unarchiveModal) unarchiveModal.style.display = "none";
  if (e.target === groupInfoModal) groupInfoModal.style.display = "none";
});

// ==================== INITIALIZATION ====================
async function init() {
  await loadChats();
  await loadActiveStories();
  await updateTabBadges();
}

init();
