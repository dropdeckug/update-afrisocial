// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");

// ══════════════════════════════════════════════
//  TERMS DATA
// ══════════════════════════════════════════════
const TERMS_SECTIONS = [
  {
    id: "s1",
    num: "01",
    title: "About Afrisocial",
    subtitle: "What is Afrisocial?",
    icon: "🌍",
    content: `<p>Afrisocial is a social networking and creator platform built for African communities and global users to connect, share, and grow.</p>`,
    groups: [
      {
        icon: "📱",
        title: "What you can do on Afrisocial",
        items: [
          "Share content — photos, videos, stories, and posts",
          "Connect with other users and follow creators",
          "Watch short-form videos on Vybze",
          "Send messages to friends and communities",
          "Purchase and use Stars to support creators",
          "Send Gifts to creators and other users",
          "Participate in referral programs",
          "Engage with communities and discussions",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "ℹ️",
      text: "Afrisocial may add, remove, or modify features at any time without prior notice."
    }
  },
  {
    id: "s2",
    num: "02",
    title: "Eligibility",
    subtitle: "Who can use Afrisocial?",
    icon: "✅",
    content: `<p>To use Afrisocial, you must meet the following requirements.</p>`,
    groups: [
      {
        icon: "✅",
        title: "You must",
        items: [
          "Be at least 13 years old",
          "Have the legal ability to agree to these Terms",
          "Provide accurate account information",
          "Not be previously banned from using Afrisocial",
        ]
      }
    ],
    alert: {
      type: "warning",
      icon: "⚠️",
      text: "Users under 18 should use the platform with parental or guardian supervision."
    }
  },
  {
    id: "s3",
    num: "03",
    title: "User Accounts",
    subtitle: "Your responsibilities",
    icon: "👤",
    content: `<p>You are responsible for your account and all activity that occurs under it.</p>`,
    groups: [
      {
        icon: "🔒",
        title: "Your responsibilities",
        items: [
          "Keeping your account secure at all times",
          "Maintaining confidentiality of your password",
          "All activities that occur under your account",
          "Providing accurate and updated information",
        ]
      },
      {
        icon: "🚫",
        title: "You agree NOT to",
        items: [
          "Impersonate another person or entity",
          "Create fake or misleading accounts",
          "Sell or transfer your account to others",
          "Share your login credentials with others",
          "Use automated bots or scripts to access the platform",
        ]
      }
    ],
    alert: {
      type: "danger",
      icon: "🚨",
      text: "Afrisocial reserves the right to suspend or terminate accounts that violate these Terms."
    }
  },
  {
    id: "s4",
    num: "04",
    title: "User Content",
    subtitle: "Your content, your ownership",
    icon: "📸",
    content: `<p>You retain ownership of the content you post on Afrisocial, including photos, videos, stories, comments, messages, profile information, and audio.</p><p>However, by posting content on Afrisocial, you grant Afrisocial a <strong>non-exclusive, worldwide, royalty-free license</strong> to display, distribute, promote, store, and process your content for platform operations.</p>`,
    groups: [],
    alert: {
      type: "warning",
      icon: "⚠️",
      text: "You are solely responsible for the content you upload. Ensure you have rights to post any content you share."
    }
  },
  {
    id: "s5",
    num: "05",
    title: "Prohibited Content & Activities",
    subtitle: "What is not allowed",
    icon: "🚫",
    content: `<p>You may not use Afrisocial to engage in any of the following prohibited activities. Violations may result in content removal, account suspension, permanent bans, wallet restrictions, or legal reporting to authorities.</p>`,
    groups: [
      {
        icon: "⚖️",
        title: "Illegal Activities",
        items: [
          "Violate laws or regulations of any jurisdiction",
          "Promote criminal activity or fraud",
          "Engage in money laundering",
          "Share stolen personal information",
        ]
      },
      {
        icon: "💢",
        title: "Harmful Content",
        items: [
          "Hate speech or discriminatory content",
          "Terrorist or violent extremist content",
          "Violent threats or harassment",
          "Sexual exploitation or child abuse material",
          "Racist content of any form",
        ]
      },
      {
        icon: "🤖",
        title: "Platform Abuse",
        items: [
          "Spam or fake engagement",
          "Artificial likes, views, or followers",
          "Malicious links or malware",
          "Unauthorized advertising or scraping",
          "Reverse engineering the platform",
        ]
      },
      {
        icon: "💳",
        title: "Financial Abuse",
        items: [
          "Fraudulent gift transactions",
          "Referral abuse or fake activity",
          "Chargeback abuse",
          "Unauthorized payment activity",
        ]
      }
    ]
  },
  {
    id: "s6",
    num: "06",
    title: "Messaging & Communication",
    subtitle: "How to communicate on Afrisocial",
    icon: "💬",
    content: `<p>Afrisocial messaging features are provided for legitimate communication between users. You agree not to misuse these features.</p>`,
    groups: [
      {
        icon: "🚫",
        title: "Prohibited messaging behaviors",
        items: [
          "Sending spam or unsolicited messages",
          "Harassing or threatening other users",
          "Sharing malicious links in messages",
          "Attempting to scam users via messages",
          "Sending explicit illegal content",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "🤖",
      text: "Afrisocial may use automated moderation systems to detect abuse and protect users."
    }
  },
  {
    id: "s7",
    num: "07",
    title: "Wallet, Stars & Gifts",
    subtitle: "Digital currency and monetization",
    icon: "⭐",
    content: `<p>Afrisocial provides digital wallet and monetization systems for users and creators.</p>`,
    groups: [
      {
        icon: "👛",
        title: "Wallet",
        items: [
          "Purchase Stars for use on the platform",
          "Receive Gifts from other users",
          "Participate in referral rewards",
          "Access wallet-related platform features",
        ]
      },
      {
        icon: "⭐",
        title: "Stars — important rules",
        items: [
          "Stars are digital platform credits only",
          "Stars have no cash value outside Afrisocial",
          "Stars cannot be transferred outside the platform unless officially supported",
          "Stars may not be resold or traded unofficially",
        ]
      },
      {
        icon: "🎁",
        title: "Gifts",
        items: [
          "Sending a Gift authorizes deduction of Stars from your wallet",
          "Transactions may become non-refundable after successful delivery",
          "Gift abuse or fraudulent gifting may result in restrictions",
        ]
      }
    ],
    alert: {
      type: "warning",
      icon: "⚠️",
      text: "Afrisocial reserves the right to reverse suspicious transactions and place limits on transactions for security or compliance reasons."
    }
  },
  {
    id: "s8",
    num: "08",
    title: "Referral Program",
    subtitle: "Invite friends and earn rewards",
    icon: "🔗",
    content: `<p>Afrisocial may reward users for inviting others to the platform through our referral program.</p>`,
    groups: [
      {
        icon: "🚫",
        title: "You may NOT",
        items: [
          "Create fake accounts for referral rewards",
          "Use bots or automated signups",
          "Manipulate referral systems",
          "Engage in any form of referral fraud",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "ℹ️",
      text: "Referral rewards may change at any time. Afrisocial reserves the right to remove fraudulent referrals, cancel rewards, and suspend accounts involved in abuse."
    }
  },
  {
    id: "s9",
    num: "09",
    title: "Creator Monetization",
    subtitle: "Earning on Afrisocial",
    icon: "💰",
    content: `<p>Afrisocial may allow creators to earn through Gifts, Stars, creator support systems, and future monetization programs.</p>`,
    groups: [
      {
        icon: "📋",
        title: "Creator responsibilities",
        items: [
          "Complying with local tax laws in your country",
          "Providing accurate payout information",
          "Following all monetization rules and guidelines",
        ]
      }
    ],
    alert: {
      type: "danger",
      icon: "🚨",
      text: "Afrisocial may suspend monetization access for policy violations without prior notice."
    }
  },
  {
    id: "s10",
    num: "10",
    title: "Intellectual Property",
    subtitle: "Our platform, our rights",
    icon: "©️",
    content: `<p>Afrisocial owns all rights related to the platform's branding, logos, design systems, software, features, source code, and platform visuals.</p>`,
    groups: [
      {
        icon: "🚫",
        title: "You may NOT",
        items: [
          "Copy platform features unlawfully",
          "Reproduce Afrisocial branding or logos",
          "Reverse engineer the platform or its code",
          "Use Afrisocial assets without written permission",
        ]
      }
    ]
  },
  {
    id: "s11",
    num: "11",
    title: "Copyright Complaints",
    subtitle: "Report copyright infringement",
    icon: "📨",
    content: `<p>If you believe your copyrighted content has been used improperly on Afrisocial, you may submit a copyright complaint. Your complaint must include:</p>`,
    groups: [
      {
        icon: "📋",
        title: "Required in your complaint",
        items: [
          "Your full contact information",
          "Proof of ownership of the content",
          "Clear description of the infringing content",
          "URL or location of the infringing material on Afrisocial",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "ℹ️",
      text: "Afrisocial may remove content pending investigation of copyright complaints."
    }
  },
  {
    id: "s12",
    num: "12",
    title: "Privacy",
    subtitle: "How we handle your data",
    icon: "🔒",
    content: `<p>Your use of Afrisocial is also governed by our <strong>Privacy Policy</strong>. By using the platform, you agree to how Afrisocial collects, stores, and processes data according to the Privacy Policy.</p><p>We are committed to protecting your personal information and will never sell your data to third parties without your consent.</p>`,
    groups: []
  },
  {
    id: "s13",
    num: "13",
    title: "Moderation & Enforcement",
    subtitle: "Keeping Afrisocial safe",
    icon: "🛡️",
    content: `<p>Afrisocial maintains a safe environment through active moderation and enforcement.</p>`,
    groups: [
      {
        icon: "⚙️",
        title: "Afrisocial reserves the right to",
        items: [
          "Remove any content that violates these Terms",
          "Restrict visibility of accounts or content",
          "Suspend or terminate user accounts",
          "Disable features for specific users",
          "Limit wallet access for suspicious activity",
          "Investigate suspicious behavior",
        ]
      },
      {
        icon: "🔍",
        title: "Moderation may involve",
        items: [
          "Automated moderation systems",
          "Human review of reported content",
          "User-submitted reports and flags",
        ]
      }
    ],
    alert: {
      type: "warning",
      icon: "⚠️",
      text: "Afrisocial may act without prior notice where necessary to protect users or the platform."
    }
  },
  {
    id: "s14",
    num: "14",
    title: "Termination",
    subtitle: "Account suspension and bans",
    icon: "🚷",
    content: `<p>You may stop using Afrisocial at any time. Afrisocial may also suspend or terminate your account under certain conditions.</p>`,
    groups: [
      {
        icon: "⛔",
        title: "Afrisocial may terminate your account if",
        items: [
          "You violate these Terms & Conditions",
          "Your activity risks platform security",
          "Fraud or abuse is detected on your account",
          "Required by applicable law",
        ]
      },
      {
        icon: "💥",
        title: "Termination may result in",
        items: [
          "Loss of access to your account",
          "Removal of your content from the platform",
          "Wallet and Stars restrictions",
          "Permanent ban from Afrisocial",
        ]
      }
    ]
  },
  {
    id: "s15",
    num: "15",
    title: "Disclaimer",
    subtitle: "Use at your own risk",
    icon: "⚠️",
    content: `<p>Afrisocial is provided <strong>"as is"</strong> and <strong>"as available"</strong>. We do not guarantee continuous uptime, error-free service, uninterrupted access, or complete security against all cyber threats.</p><p>Users use the platform at their own risk.</p>`,
    groups: []
  },
  {
    id: "s16",
    num: "16",
    title: "Limitation of Liability",
    subtitle: "What we are not responsible for",
    icon: "⚖️",
    content: `<p>To the maximum extent permitted by law, Afrisocial shall not be liable for:</p>`,
    groups: [
      {
        icon: "📜",
        title: "Afrisocial is NOT liable for",
        items: [
          "Indirect or consequential damages",
          "Lost profits or business losses",
          "Data loss or corruption",
          "Account loss due to violations",
          "Disputes between users",
          "Unauthorized account access by third parties",
          "Third-party actions on the platform",
        ]
      }
    ],
    alert: {
      type: "info",
      icon: "ℹ️",
      text: "This limitation applies even if Afrisocial was advised of the possibility of such damages."
    }
  },
  {
    id: "s17",
    num: "17",
    title: "Changes to These Terms",
    subtitle: "How we update our Terms",
    icon: "🔄",
    content: `<p>Afrisocial may update these Terms at any time. When changes are made, the effective date will be revised and significant updates may be announced within the platform.</p><p><strong>Continued use of Afrisocial after updates means you accept the revised Terms.</strong></p>`,
    groups: []
  },
  {
    id: "s18",
    num: "18",
    title: "Governing Law",
    subtitle: "Legal jurisdiction",
    icon: "🏛️",
    content: `<p>These Terms shall be governed by and interpreted under the laws applicable in <strong>Nigeria</strong>, unless otherwise required by local laws in your jurisdiction.</p>`,
    groups: []
  },
  {
    id: "s19",
    num: "19",
    title: "Contact Information",
    subtitle: "Get in touch with us",
    icon: "📧",
    content: `<p>For support, legal concerns, or policy questions, please reach out to the Afrisocial team.</p>`,
    groups: [],
    contact: true
  },
  {
    id: "s20",
    num: "20",
    title: "Final Agreement",
    subtitle: "Your acceptance",
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
  TERMS_SECTIONS.forEach(section => {
    const a = document.createElement("a");
    a.href = `#${section.id}`;
    a.className = "toc-item";
    a.innerHTML = `<span class="toc-num">${section.num}</span>${section.title}`;
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = document.getElementById(section.id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!target.classList.contains("open")) {
          target.classList.add("open");
        }
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

  // Build groups HTML
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

  // Contact card HTML
  let contactHTML = "";
  if (section.contact) {
    contactHTML = `
      <div class="contact-card">
        <div class="contact-card-icon">📩</div>
        <div class="contact-card-info">
          <h4>Afrisocial Support</h4>
          <p>Legal, policy & general questions</p>
        </div>
        <a href="https://afrisocial.com.ng" class="contact-card-link" target="_blank">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Visit
        </a>
      </div>
    `;
  }

  // Final agreement HTML
  if (section.finalAgreement) {
    div.innerHTML = `
      <div class="final-agreement">
        <span class="final-agreement-icon">🤝</span>
        <h3>Final Agreement</h3>
        <p>These Terms constitute the complete agreement between you and Afrisocial regarding use of the platform. By using Afrisocial, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
        <div class="agree-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          I Agree to These Terms
        </div>
      </div>
    `;
    return div;
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
      <div class="section-text">
        ${section.content || ""}
      </div>
      ${groupsHTML}
      ${alertHTML}
      ${contactHTML}
    </div>
  `;

  // Toggle accordion
  const header = div.querySelector(".section-header");
  if (header) {
    header.addEventListener("click", () => {
      const isOpen = div.classList.contains("open");
      // Close all
      document.querySelectorAll(".terms-section.open").forEach(s => s.classList.remove("open"));
      // Open this one if it was closed
      if (!isOpen) div.classList.add("open");
    });
  }

  return div;
}

// ══════════════════════════════════════════════
//  RENDER ALL SECTIONS
// ══════════════════════════════════════════════
function buildSections() {
  const main = document.getElementById("termsMain");
  TERMS_SECTIONS.forEach(section => {
    main.appendChild(buildSectionCard(section));
  });
  // Open first section by default
  const first = document.querySelector(".terms-section");
  if (first) first.classList.add("open");
}

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
buildTOC();
buildSections();
