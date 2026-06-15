// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");

// ══════════════════════════════════════════════
//  PRIVACY SECTIONS DATA
// ══════════════════════════════════════════════
const PRIVACY_SECTIONS = [
  {
    id: "p-intro",
    num: "00",
    title: "Introduction",
    subtitle: "What this policy covers",
    icon: "👋",
    content: `<p>Welcome to Afrisocial. This Privacy Policy explains how Afrisocial collects, uses, stores, protects, and shares user information when using the Afrisocial platform, website, mobile experience, wallet services, messaging systems, gifting systems, and related services.</p><p>By using Afrisocial, you agree to this Privacy Policy. If you do not agree with this policy, you should not use the platform.</p>`,
    groups: []
  },
  {
    id: "p1",
    num: "01",
    title: "Account Information",
    subtitle: "What we collect when you sign up",
    icon: "👤",
    content: `<p>When you create an account on Afrisocial, we may collect the following information to set up and manage your account.</p>`,
    groups: [
      {
        icon: "📋",
        title: "Information collected at signup",
        items: [
          "Full name and username",
          "Email address and password",
          "Profile photo and bio information",
          "Date of birth",
          "Gender (optional)",
          "Phone number (optional)",
          "Verification information for account security",
        ]
      }
    ]
  },
  {
    id: "p2",
    num: "02",
    title: "Content You Create",
    subtitle: "Your posts, videos, and interactions",
    icon: "📸",
    content: `<p>We collect and store the content you upload or create on Afrisocial as part of the platform experience.</p>`,
    groups: [
      {
        icon: "🗂️",
        title: "Content we collect",
        items: [
          "Posts, photos, videos, and stories",
          "Comments, replies, and reactions",
          "Messages and shared media",
          "Gift transactions and wallet activity",
          "Referral activity and records",
          "Profile information and updates",
          "Polls, likes, and stars given",
        ]
      }
    ]
  },
  {
    id: "p3",
    num: "03",
    title: "Wallet & Payment Information",
    subtitle: "How we handle financial data",
    icon: "💳",
    content: `<p>When using Afrisocial Wallet or Stars features, we collect certain transaction and payment-related information.</p>`,
    groups: [
      {
        icon: "💰",
        title: "Financial data we collect",
        items: [
          "Wallet balance and transaction history",
          "Gift transaction records and referral rewards",
          "Purchase history and payment reference IDs",
          "Payment provider confirmations",
          "Fraud prevention and risk information",
        ]
      }
    ],
    alert: {
      type: "success",
      icon: "✅",
      text: "Afrisocial does NOT store complete debit card or banking credentials directly on our servers. Payments are processed through trusted third-party payment providers."
    }
  },
  {
    id: "p4",
    num: "04",
    title: "Messaging Information",
    subtitle: "Your direct messages and chats",
    icon: "💬",
    content: `<p>Afrisocial may collect and store messaging data to operate the messaging features of the platform.</p>`,
    groups: [
      {
        icon: "📩",
        title: "What we collect from messages",
        items: [
          "Direct messages and shared media",
          "Chat timestamps and delivery status",
          "Message delivery and read information",
          "Reported conversations for abuse review",
        ]
      },
      {
        icon: "🔍",
        title: "Messages may only be reviewed when",
        items: [
          "Required for abuse and fraud investigations",
          "Required for safety enforcement",
          "Required by applicable law or legal order",
        ]
      }
    ]
  },
  {
    id: "p5",
    num: "05",
    title: "Device & Technical Information",
    subtitle: "Automatically collected data",
    icon: "📱",
    content: `<p>We may automatically collect technical information about your device and how you access Afrisocial.</p>`,
    groups: [
      {
        icon: "💻",
        title: "Device data we collect",
        items: [
          "Device type, browser type, and operating system",
          "IP address and network information",
          "App or browser version",
          "Login activity and session information",
          "Crash logs and error reports",
          "Device identifiers",
          "Cookies and analytics data",
        ]
      }
    ]
  },
  {
    id: "p6",
    num: "06",
    title: "Usage Information",
    subtitle: "How you use the platform",
    icon: "📊",
    content: `<p>We collect information about how users interact with Afrisocial to improve the platform experience and recommendations.</p>`,
    groups: [
      {
        icon: "📈",
        title: "Usage data we collect",
        items: [
          "Content engagement and watch time",
          "Likes, comments, and search activity",
          "Referral and feature usage",
          "Time spent on platform",
          "Creator support activity",
          "Wallet usage behavior",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "ℹ️",
      text: "This helps us improve your platform experience, recommendations, and overall product quality."
    }
  },
  {
    id: "p7",
    num: "07",
    title: "How We Use Your Information",
    subtitle: "Why we collect what we collect",
    icon: "⚙️",
    content: `<p>Afrisocial uses the information we collect for the following purposes:</p>`,
    groups: [
      {
        icon: "🛠️",
        title: "Platform operations",
        items: [
          "Provide and manage platform services",
          "Create and manage user accounts",
          "Process wallet and Stars transactions",
          "Deliver and track gifts",
          "Operate referral systems",
        ]
      },
      {
        icon: "🔒",
        title: "Safety and security",
        items: [
          "Prevent spam, fraud, and abuse",
          "Detect harmful or illegal activity",
          "Moderate content across the platform",
          "Improve platform security systems",
          "Enforce platform rules and Terms",
        ]
      },
      {
        icon: "📱",
        title: "Experience and growth",
        items: [
          "Improve recommendations and content feed",
          "Improve overall user experience",
          "Analyze platform performance",
          "Provide customer support",
          "Send important platform updates",
        ]
      }
    ]
  },
  {
    id: "p8",
    num: "08",
    title: "Wallet, Gifts & Referral Data",
    subtitle: "Transaction data processing",
    icon: "⭐",
    content: `<p>Afrisocial processes transaction-related information to operate its wallet, gifting, and referral systems effectively and securely.</p>`,
    groups: [
      {
        icon: "💳",
        title: "Transaction data is used for",
        items: [
          "Buying and tracking Stars purchases",
          "Processing gift sends and receives",
          "Distributing referral rewards",
          "Wallet analytics and balance tracking",
          "Fraud monitoring and prevention",
          "Refund investigations and disputes",
        ]
      }
    ],
    alert: {
      type: "warning",
      icon: "⚠️",
      text: "Transaction records may be retained for legal, financial, security, and anti-fraud purposes. Afrisocial reserves the right to investigate suspicious transactions, referral abuse, and fraudulent wallet activity."
    }
  },
  {
    id: "p9",
    num: "09",
    title: "Cookies & Analytics",
    subtitle: "Tracking and performance tools",
    icon: "🍪",
    content: `<p>Afrisocial may use cookies and analytics technologies to improve the platform experience.</p>`,
    groups: [
      {
        icon: "🔧",
        title: "What cookies are used for",
        items: [
          "Keeping you logged in securely",
          "Improving platform performance",
          "Understanding feature usage patterns",
          "Detecting suspicious or unusual activity",
          "Improving content recommendations",
          "Analyzing traffic and user engagement",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "ℹ️",
      text: "Users may disable cookies through browser settings, though some platform features may not function properly without them."
    }
  },
  {
    id: "p10",
    num: "10",
    title: "Content Visibility",
    subtitle: "Who can see your content",
    icon: "👁️",
    content: `<p>Understanding what is visible and what is private on Afrisocial is important.</p>`,
    groups: [
      {
        icon: "🌍",
        title: "Public content may be visible to",
        items: [
          "Other registered Afrisocial users",
          "Search engines and web crawlers",
          "Platform visitors and guests",
          "Anyone with a shared link to your post",
        ]
      },
      {
        icon: "🔒",
        title: "Private by default",
        items: [
          "Direct messages are not publicly visible",
          "Wallet balances and transactions are private",
          "Account security information is private",
        ]
      }
    ],
    alert: {
      type: "warning",
      icon: "⚠️",
      text: "Users are responsible for the content they choose to publish publicly on Afrisocial."
    }
  },
  {
    id: "p11",
    num: "11",
    title: "Sharing With Third Parties",
    subtitle: "When and why we share data",
    icon: "🤝",
    content: `<p><strong>Afrisocial does not sell personal user data.</strong> However, we may share limited information in the following situations:</p>`,
    groups: [
      {
        icon: "🛠️",
        title: "Service providers",
        items: [
          "Payment processing partners",
          "Cloud hosting infrastructure",
          "Security and fraud prevention systems",
          "Analytics and performance tools",
          "Content moderation services",
          "Push notification systems",
        ]
      },
      {
        icon: "⚖️",
        title: "Legal compliance",
        items: [
          "To comply with applicable laws and regulations",
          "To respond to valid legal requests or court orders",
          "To prevent fraud or protect user safety",
          "To enforce platform rules and investigate abuse",
        ]
      },
      {
        icon: "🏢",
        title: "Business transfers",
        items: [
          "If Afrisocial is involved in a merger or acquisition",
          "If Afrisocial undergoes restructuring or sale",
          "User data may be transferred as part of the process",
        ]
      }
    ]
  },
  {
    id: "p12",
    num: "12",
    title: "Data Protection & Security",
    subtitle: "How we keep your data safe",
    icon: "🛡️",
    content: `<p>Afrisocial uses reasonable technical and organizational security measures to protect user information.</p>`,
    groups: [
      {
        icon: "🔐",
        title: "Security measures we use",
        items: [
          "Secure authentication systems",
          "Encrypted connections (HTTPS)",
          "Strict access restrictions for data",
          "Continuous fraud monitoring",
          "Security logging and audit trails",
          "Abuse detection and rate limiting",
          "Content moderation systems",
        ]
      }
    ],
    alert: {
      type: "warning",
      icon: "⚠️",
      text: "No online platform can guarantee absolute security. Users are responsible for protecting their login credentials and keeping passwords private."
    }
  },
  {
    id: "p13",
    num: "13",
    title: "Account Safety",
    subtitle: "Your responsibility to stay safe",
    icon: "🔑",
    content: `<p>While Afrisocial implements security measures, users also have responsibilities to keep their accounts secure.</p>`,
    groups: [
      {
        icon: "✅",
        title: "Users should",
        items: [
          "Use strong and unique passwords",
          "Keep login credentials completely private",
          "Never share verification codes with anyone",
          "Report suspicious activity immediately to support",
        ]
      }
    ],
    alert: {
      type: "danger",
      icon: "🚨",
      text: "Afrisocial is not responsible for losses caused by unauthorized account access resulting from user negligence."
    }
  },
  {
    id: "p14",
    num: "14",
    title: "User Rights",
    subtitle: "Your rights over your data",
    icon: "✊",
    content: `<p>Depending on your location and applicable laws, you may have certain rights regarding your personal data on Afrisocial.</p>`,
    groups: [
      {
        icon: "📋",
        title: "Your rights may include",
        items: [
          "Access to your personal data",
          "Correcting inaccurate information",
          "Deleting your account and information",
          "Requesting a copy of stored information",
          "Objecting to certain types of processing",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "ℹ️",
      text: "Users may contact Afrisocial support to submit privacy requests or questions about their data."
    }
  },
  {
    id: "p15",
    num: "15",
    title: "Account Deletion",
    subtitle: "What happens when you delete your account",
    icon: "🗑️",
    content: `<p>Users may request account deletion at any time. However, some information may be retained temporarily after deletion.</p>`,
    groups: [
      {
        icon: "⏳",
        title: "Data may be retained temporarily for",
        items: [
          "Fraud prevention and security investigations",
          "Legal obligations and compliance",
          "Financial record requirements",
          "Abuse enforcement purposes",
          "Backup systems and data recovery",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "ℹ️",
      text: "Public interactions from deleted accounts may remain visible in limited situations on the platform."
    }
  },
  {
    id: "p16",
    num: "16",
    title: "Children's Privacy",
    subtitle: "Age restrictions and protection",
    icon: "👶",
    content: `<p>Afrisocial is not intended for children below the minimum age required by local law.</p><p>Users below the permitted age should not create Afrisocial accounts. If we discover underage accounts violating this policy, we may remove them immediately.</p>`,
    groups: [],
    alert: {
      type: "danger",
      icon: "🚨",
      text: "If you believe a child is using Afrisocial in violation of our age policy, please report it to our support team immediately."
    }
  },
  {
    id: "p17",
    num: "17",
    title: "Content Moderation & Safety",
    subtitle: "Keeping the platform safe",
    icon: "🛡️",
    content: `<p>Afrisocial uses automated systems and human moderation to maintain a safe platform environment.</p>`,
    groups: [
      {
        icon: "🤖",
        title: "Moderation systems detect",
        items: [
          "Harmful and abusive content",
          "Spam and unsolicited messages",
          "Scam and fraudulent activity",
          "Fake engagement and bot activity",
          "Illegal activity and content",
        ]
      },
      {
        icon: "⚠️",
        title: "Moderation actions may include",
        items: [
          "Content removal from the platform",
          "Warning notices to users",
          "Account restrictions or feature limits",
          "Temporary suspension",
          "Permanent bans for severe violations",
        ]
      }
    ]
  },
  {
    id: "p18",
    num: "18",
    title: "International Data Processing",
    subtitle: "Where your data is processed",
    icon: "🌍",
    content: `<p>Users understand that data may be processed on servers located in different countries depending on infrastructure providers and operational requirements.</p><p>By using Afrisocial, you consent to data being processed internationally in accordance with this Privacy Policy.</p>`,
    groups: []
  },
  {
    id: "p19",
    num: "19",
    title: "Intellectual Property",
    subtitle: "Platform rights and your content",
    icon: "©️",
    content: `<p>Afrisocial owns all rights related to the platform's branding, logos, design systems, software, features, source code, and platform visuals. At the same time, you retain ownership of the content you create and post.</p>`,
    groups: [
      {
        icon: "✅",
        title: "You retain ownership of",
        items: [
          "Content you create and post on Afrisocial",
          "Photos, videos, and stories you upload",
          "Your profile and personal information",
        ]
      },
      {
        icon: "📜",
        title: "By posting, you grant Afrisocial a license to",
        items: [
          "Display your content on the platform",
          "Distribute and promote your content within Afrisocial",
          "Store and process your content for platform operations",
        ]
      },
      {
        icon: "🚫",
        title: "You may NOT",
        items: [
          "Copy or reproduce Afrisocial branding or logos",
          "Reverse engineer the platform or its code",
          "Use Afrisocial platform assets without permission",
        ]
      }
    ]
  },
  {
    id: "p20",
    num: "20",
    title: "Changes To This Policy",
    subtitle: "How we update this policy",
    icon: "🔄",
    content: `<p>Afrisocial may update this Privacy Policy at any time. When significant updates are made, the effective date will change and users may be notified through the platform.</p><p><strong>Continued use of Afrisocial after updates means you accept the revised Privacy Policy.</strong></p>`,
    groups: []
  },
  {
    id: "p21",
    num: "21",
    title: "Contact Information",
    subtitle: "Privacy concerns and legal inquiries",
    icon: "📧",
    content: `<p>For privacy concerns, data requests, or legal inquiries, users may contact Afrisocial through official support channels available on the platform.</p>`,
    groups: [],
    contact: true
  },
  {
    id: "p22",
    num: "22",
    title: "Final Notice",
    subtitle: "Your acknowledgement",
    icon: "✍️",
    content: null,
    groups: [],
    finalAgreement: true
  }
];

// ══════════════════════════════════════════════
//  BUILD TABLE OF CONTENTS
// ══════════════════════════════════════════════
function buildTOC() {
  const grid = document.getElementById("tocGrid");
  PRIVACY_SECTIONS.forEach(section => {
    const a = document.createElement("a");
    a.href = `#${section.id}`;
    a.className = "toc-item";
    a.innerHTML = `<span class="toc-num">${section.num}</span>${section.title}`;
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = document.getElementById(section.id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!target.classList.contains("open")) target.classList.add("open");
      }
    });
    grid.appendChild(a);
  });
}

// ══════════════════════════════════════════════
//  BUILD SECTION CARD
// ══════════════════════════════════════════════
function buildSectionCard(section) {
  const div = document.createElement("div");
  div.className = "terms-section";
  div.id = section.id;

  // Final notice card
  if (section.finalAgreement) {
    div.innerHTML = `
      <div class="final-agreement">
        <span class="final-agreement-icon">🤝</span>
        <h3>Final Notice</h3>
        <p>By using Afrisocial, you acknowledge that you understand this Privacy Policy, consent to the collection and use of information described here, agree to Afrisocial safety, moderation, wallet, gifting, and referral systems, and understand that online platforms cannot guarantee absolute security.</p>
        <div class="agree-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          I Understand This Policy
        </div>
      </div>
    `;
    return div;
  }

  // Groups HTML
  let groupsHTML = "";
  if (section.groups && section.groups.length > 0) {
    section.groups.forEach(group => {
      groupsHTML += `
        <div class="sub-group">
          <div class="sub-group-title">
            <span class="sub-group-title-icon">${group.icon}</span>
            ${group.title}
          </div>
          <div class="sub-group-body">
            ${group.items.map(item => `<div class="sub-item">${item}</div>`).join("")}
          </div>
        </div>
      `;
    });
  }

  // Alert HTML
  let alertHTML = "";
  if (section.alert) {
    alertHTML = `
      <div class="alert-box ${section.alert.type}">
        <span class="alert-icon">${section.alert.icon}</span>
        <span class="alert-text">${section.alert.text}</span>
      </div>
    `;
  }

  // Contact HTML
  let contactHTML = "";
  if (section.contact) {
    contactHTML = `
      <div class="contact-card">
        <div class="contact-card-icon">📩</div>
        <div class="contact-card-info">
          <h4>Afrisocial Support</h4>
          <p>Privacy, legal &amp; data requests</p>
        </div>
        <a href="https://afrisocial.com.ng" class="contact-card-link" target="_blank">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Visit
        </a>
      </div>
    `;
  }

  div.innerHTML = `
    <div class="section-header">
      <div class="section-num-badge">${section.num}</div>
      <div class="section-title-wrap">
        <div class="section-title">${section.icon} ${section.title}</div>
        <div class="section-subtitle">${section.subtitle}</div>
      </div>
      <svg class="section-chevron" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
    <div class="section-body">
      <div class="section-text">${section.content || ""}</div>
      ${groupsHTML}
      ${alertHTML}
      ${contactHTML}
    </div>
  `;

  // Accordion toggle
  div.querySelector(".section-header").addEventListener("click", () => {
    const isOpen = div.classList.contains("open");
    document.querySelectorAll(".terms-section.open").forEach(s => s.classList.remove("open"));
    if (!isOpen) div.classList.add("open");
  });

  return div;
}

// ══════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════
function buildSections() {
  const main = document.getElementById("termsMain");
  PRIVACY_SECTIONS.forEach(section => main.appendChild(buildSectionCard(section)));
  // Open intro by default
  const first = document.querySelector(".terms-section");
  if (first) first.classList.add("open");
}

buildTOC();
buildSections();
