// lib/resume-data.js

export const COLOR_PALETTES = [
  {
    id: "light-blue",
    name: "Light Blue",
    hex: "#38bdf8",
    accent: "#0284c7",
    soft: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    id: "light-green",
    name: "Light Green",
    hex: "#4ade80",
    accent: "#16a34a",
    soft: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    id: "red",
    name: "Crimson Red",
    hex: "#f87171",
    accent: "#dc2626",
    soft: "#fef2f2",
    border: "#fecaca",
  },
  {
    id: "yellow",
    name: "Warm Amber",
    hex: "#fbbf24",
    accent: "#d97706",
    soft: "#fffbeb",
    border: "#fde68a",
  },
  {
    id: "pink",
    name: "Soft Rose",
    hex: "#f472b6",
    accent: "#db2777",
    soft: "#fdf2f8",
    border: "#fbcfe8",
  },
  {
    id: "orange",
    name: "Tangerine",
    hex: "#fb923c",
    accent: "#ea580c",
    soft: "#fff7ed",
    border: "#fed7aa",
  },
];

export const TEMPLATE_DEFINITIONS = [
  // --- 5 Templates WITH Avatar (ATS Compatible) ---
  {
    id: "tech-modernist",
    name: "Tech Modernist",
    category: "Technical",
    hasAvatar: true,
    bestFor: "Full-Stack & DevOps Engineers",
    description:
      "Modern split header featuring a profile avatar, GitHub and portfolio badges.",
  },
  {
    id: "creative-professional",
    name: "Creative Professional",
    category: "Design & Media",
    hasAvatar: true,
    bestFor: "UI/UX Designers & Creators",
    description:
      "Bold layout with hero avatar display and dedicated project showcases.",
  },
  {
    id: "two-column-split",
    name: "Two Column Split",
    category: "Contemporary",
    hasAvatar: true,
    bestFor: "Product Managers & Consultants",
    description:
      "Distinct sidebar featuring circular photo, proficiency bars, and contacts.",
  },
  {
    id: "international-europass",
    name: "International Europass",
    category: "International",
    hasAvatar: true,
    bestFor: "European & Global Applications",
    description:
      "Standardised international layout with formal avatar placement.",
  },
  {
    id: "startup-innovator",
    name: "Startup Innovator",
    category: "Creative",
    hasAvatar: true,
    bestFor: "Founders & Early-Stage Hires",
    description:
      "High-contrast dynamic layout with photo integration and key builds highlight.",
  },

  // --- 5 Templates WITHOUT Avatar (100% Strict ATS Optimized) ---
  {
    id: "clean-ats-optimizer",
    name: "Clean ATS Optimizer",
    category: "ATS Classics",
    hasAvatar: false,
    bestFor: "Corporate & Enterprise ATS",
    description:
      "Linear, ultra-scannable ATS standard layout optimized for parser algorithms.",
  },
  {
    id: "executive-minimalist",
    name: "Executive Minimalist",
    category: "Leadership",
    hasAvatar: false,
    bestFor: "C-Level, VPs & Senior Directors",
    description:
      "Classic typography with high information density, clean rules, and no avatar.",
  },
  {
    id: "academic-researcher",
    name: "Academic Researcher",
    category: "Academic",
    hasAvatar: false,
    bestFor: "Postdocs, Faculty & Scientists",
    description:
      "Text-first layout prioritizing publications, citations, and credentials.",
  },
  {
    id: "consultant-strategist",
    name: "Consultant Strategist",
    category: "Consulting",
    hasAvatar: false,
    bestFor: "Management Consultants & Analysts",
    description:
      "Impact-oriented layout with structured executive briefing cards.",
  },
  {
    id: "entry-level-graduate",
    name: "Entry Level Graduate",
    category: "Entry Level",
    hasAvatar: false,
    bestFor: "Freshers & University Grads",
    description:
      "Education-forward resume prioritizing degrees, certifications, and skills.",
  },
];

export const DEMO_RESUME = {
  _id: "demo-resume-id",

  basicInfo: {
    fullName: "Aarav Mehta",
    position: "Senior Backend Engineer",
  },

  avatar: {
    url: "https://res.cloudinary.com/drdfur81n/image/upload/v1791209555/resume_default_avatar_xlmtdz.png?auto=format&fit=crop&w=400&h=400&q=80",
    key: "avatar-demo",
  },

  address: {
    streetName: "42 River Lane",
    city: "Pune",
    district: "Pune",
    pincode: "411001",
    country: "India",
  },

  contactInfo: {
    primaryEmail: "aarav.mehta@example.com",
    primaryMobile: "+919876543210",
    linkedin: "https://linkedin.com/in/aarav-mehta",
    github: "https://github.com/aarav-mehta",
    portfolio: "https://aaravmehta.dev",
  },

  profileSummary: {
    priority: 1,
    subject: "Backend Engineer",
    objective:
      "Results-driven Backend Engineer with 5+ years specializing in distributed systems, event-driven architecture, and high-performance microservices. Proven record in reducing API latencies by 35% and operating multi-region Redis/Kafka clusters.",
  },

  workExperience: {
    priority: 2,
    sectionTitle: "Work Experience",

    companies: {
      "comp-1": {
        priority: 1,
        jobTitle: "Senior Backend Engineer",
        companyName: "Northstar Technologies",
        jobConditions: "REMOTE",
        jobTypes: "FULL_TIME",
        jobLocation: "Pune, India",
        startDate: "2023-01",
        endDate: "",
        isPresentJob: true,

        responsibility: [
          "Architected real-time ingestion pipelines processing over 45M messages daily using Kafka and Go.",
          "Refactored legacy database queries, trimming P99 response times from 340ms to 48ms.",
          "Mentored an engineering squad of 6 junior devs on distributed caching and clean architecture.",
        ],
      },

      "comp-2": {
        priority: 2,
        jobTitle: "Software Development Engineer II",
        companyName: "Vertex Cloud Systems",
        jobConditions: "HYBRID",
        jobTypes: "FULL_TIME",
        jobLocation: "Bengaluru, India",
        startDate: "2021-06",
        endDate: "2022-12",
        isPresentJob: false,

        responsibility: [
          "Engineered multi-tenant IAM microservice supporting OAuth2 and SAML Single Sign-On.",
          "Implemented comprehensive CI/CD pipelines cut automated test deployment times by 40%.",
        ],
      },
    },
  },

  projects: {
    priority: 3,
    sectionTitle: "Projects",

    projects: {
      "proj-1": {
        priority: 1,
        name: "Distributed Stream Tracer",
        description:
          "Open-source observability engine mapping cross-service HTTP and gRPC spans across microservices with Zero-allocation instrumentation.",
        projectUrl: "https://github.com/aarav-mehta/stream-tracer",
        startDate: "2024-03",
        endDate: "2024-11",
        isWorking: false,

        techStack: [
          "TypeScript",
          "Node.js",
          "Redis",
          "Docker",
          "OpenTelemetry",
        ],

        skills: [
          "Distributed Tracing",
          "Microservices",
          "Performance Profiling",
        ],
      },

      "proj-2": {
        priority: 2,
        name: "Cloudinary Resume Sync API",
        description:
          "Multipart file processor integrating signed Cloudinary upload tokens and automatic WebP image compression pipelines.",
        projectUrl: "https://github.com/aarav-mehta/resume-api",
        startDate: "2025-01",
        endDate: "",
        isWorking: true,

        techStack: [
          "Node.js",
          "MongoDB",
          "Express",
          "Cloudinary SDK",
        ],

        skills: [
          "RESTful API",
          "Multipart File Handling",
          "Cloud Storage",
        ],
      },
    },
  },

  educations: {
    priority: 4,
    sectionTitle: "Education",

    qualifications: {
      "edu-1": {
        priority: 1,
        institutionName: "Pune Institute of Computer Technology",
        startedAt: "2017-08",
        yearOfComplete: "2021-06",
        pursuing: false,
        percentage: "8.8 CGPA",
        description: "B.Tech in Computer Science and Engineering",
      },

      "edu-2": {
        priority: 2,
        institutionName: "Delhi Public School",
        startedAt: "2015-04",
        yearOfComplete: "2017-03",
        pursuing: false,
        percentage: "94.2%",
        description: "Higher Secondary Certificate (HSC) - Science",
      },
    },
  },

  certifications: {
    priority: 5,
    sectionTitle: "Certifications",

    certificates: {
      "cert-1": {
        priority: 1,
        overview: "AWS Certified Solutions Architect – Associate",
        skillLearned: ["AWS", "VPC", "ECS", "DynamoDB", "S3"],
        duration: "3 months",
        certificateUrl: "https://www.credly.com/",
      },

      "cert-2": {
        priority: 2,
        overview: "Certified Kubernetes Administrator (CKA)",
        skillLearned: ["Kubernetes", "Helm", "Cluster Ingress", "RBAC"],
        duration: "2 months",
        certificateUrl: "https://www.cncf.io/certification/cka/",
      },
    },
  },

  skills: {
    priority: 6,
    sectionTitle: "Skills",

    skills: {
      "Languages & Core": [
        "TypeScript",
        "JavaScript",
        "Go",
        "SQL",
        "HTML5/CSS3",
      ],

      "Backend & Databases": [
        "Node.js",
        "Express",
        "MongoDB",
        "PostgreSQL",
        "Redis",
      ],

      "DevOps & Cloud": [
        "Docker",
        "Kubernetes",
        "AWS",
        "Git",
        "Nginx",
        "CI/CD",
      ],
    },
  },

  publications: {
    priority: 7,
    sectionTitle: "Publications",

    publications: {
      "pub-1": {
        priority: 1,
        description:
          "Distributed Tracing Patterns in Modern Cloud-Native Architectures (IEEE Transactions 2025)",
        referenceUrl: "https://doi.org/10.1109/sample.2025",
        publicationReference: [],
      },

      "pub-2": {
        priority: 2,
        description:
          "Zero-Cost Cache Invalidation via Redis Streams (ACM Distributed Systems Review 2024)",
        referenceUrl: "https://doi.org/10.1145/sample.2024",
        publicationReference: [],
      },
    },
  },

  awardsAndAchievements: {
    priority: 8,
    sectionTitle: "Awards & Achievements",

    achievements: [
      {
        priority: 1,
        title: "National Smart India Hackathon Winner",
        description:
          "1st prize out of 500+ competing engineering institutes across India.",
        documents: [],
      },

      {
        priority: 2,
        title: "Northstar High Performer of the Year",
        description:
          "Awarded top engineering excellence contributor in 2024.",
        documents: [],
      },
    ],
  },

  openSource: {
    priority: 9,
    sectionTitle: "Open Source",

    contributions: {
      "Subatom Framework": {
        priority: 1,
        githubUrl: "https://github.com/example/subatom",
        description:
          "Contributed runtime and developer-experience improvements to an open-source TypeScript backend framework.",
        duration: "2025 – Present",
      },
    },
  },

  languageProficiency: {
    priority: 10,
    sectionTitle: "Languages",

    languageKnows: [
      {
        languageName: "English",
        proficiencyOutOfTen: 9,
      },
      {
        languageName: "Hindi",
        proficiencyOutOfTen: 10,
      },
      {
        languageName: "Marathi",
        proficiencyOutOfTen: 8,
      },
    ],
  },

  hobbies: {
    priority: 11,
    sectionTitle: "Hobbies",

    Photography: "Street photography and visual storytelling",
    Reading: "Technology, business and systems design",
  },

  // Custom metadata support
  customAttributes: [],

  templateName: "clean-ats-optimizer",
  themeColor: "light-blue",
};

export const EMPTY_RESUME = {
  basicInfo: {
    fullName: "",
    position: "",
  },

  avatar: {
    url: "",
    key: "",
  },

  address: {
    streetName: "",
    city: "",
    district: "",
    pincode: "",
    country: "",
  },

  contactInfo: {
    primaryEmail: "",
    primaryMobile: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },

  profileSummary: {
    priority: 1,
    subject: "",
    objective: "",
  },

  workExperience: {
    priority: 2,
    sectionTitle: "Work Experience",
    companies: {},
  },

  projects: {
    priority: 3,
    sectionTitle: "Projects",
    projects: {},
  },

  educations: {
    priority: 4,
    sectionTitle: "Education",
    qualifications: {},
  },

  certifications: {
    priority: 5,
    sectionTitle: "Certifications",
    certificates: {},
  },

  skills: {
    priority: 6,
    sectionTitle: "Skills",
    skills: {},
  },

  publications: {
    priority: 7,
    sectionTitle: "Publications",
    publications: {},
  },

  awardsAndAchievements: {
    priority: 8,
    sectionTitle: "Awards & Achievements",
    achievements: [],
  },

  openSource: {
    priority: 9,
    sectionTitle: "Open Source",
    contributions: {},
  },

  languageProficiency: {
    priority: 10,
    sectionTitle: "Languages",
    languageKnows: [],
  },

  hobbies: {
    priority: 11,
    sectionTitle: "Hobbies",
  },

  // Custom metadata support
  customAttributes: [],

  templateName: "clean-ats-optimizer",
  themeColor: "light-blue",
};

export function cloneResume(data) {
  return JSON.parse(JSON.stringify(data));
}

