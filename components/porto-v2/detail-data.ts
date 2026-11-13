export const projects = [
  {
    slug: "sakode-academy", title: "Sakode Academy", category: "EDUCATION / PUBLIC WEBSITE", subtitle: "A public front door for coding education in Garut.", role: "Frontend developer", team: "Sakode Academy", surface: "Company profile website", visual: "/porto-v2/sakode-home.png", alt: "Sakode Academy landing page with coding class illustration", caption: "SUPPLIED PRODUCT VISUAL / SAKODE ACADEMY", external: "https://sakode.com", sections: [
      ["Context", "Sakode Academy is developing coding education for children. Its public website introduces the classes, projects, mentors, and team behind that work."],
      ["My contribution", "I continued development on the frontend of the existing company profile landing page. My wider role at Sakode includes leading the organization, but this story is about the website interface."],
      ["What shipped", "The site brings the learning offer, real projects, team, FAQs, and navigation together in one public browsing flow."],
    ],
  },
  {
    slug: "aisnet-mobile", title: "AISnet Mobile", category: "EDUCATION / MOBILE APPLICATION", subtitle: "Academic information within reach of ITG students.", role: "UI design + Flutter", team: "ITG Developer", surface: "Mobile application", visual: "/porto-v2/aisnet-artwork.png", alt: "AISnet Mobile official store artwork showing two phone screens with academic services", caption: "SUPPLIED PRODUCT VISUAL / AISNET MOBILE", sections: [
      ["Context", "AISnet Mobile gives students a mobile entry point to academic information and services, including schedules, attendance, transcripts, and campus services."],
      ["My contribution", "I designed the mobile interface and built the Flutter application. For backend data, the app uses an API that was already in use; this case does not claim backend ownership."],
      ["What shipped", "The shipped app brings the academic dashboard and service access into a touch-friendly interface. The visual shown here is the official store artwork supplied for AISnet."],
    ],
  },
  {
    slug: "reyyaid-top-up", title: "ReyyAid Top Up", category: "COMMERCE / WEB FRONTEND", subtitle: "A game top-up storefront built with Puru Software Agency.", role: "Frontend developer", team: "Puru Software Agency", surface: "Top-up website", visual: "/porto-v2/reyy-home.png", alt: "ReyyAid Top Up storefront showing game artwork and purchase actions", caption: "SUPPLIED PRODUCT VISUAL / REYYAID TOP UP", sections: [
      ["Context", "ReyyAid is a game top-up website where visitors can browse game titles, choose a product, and continue to an account-specific order flow."],
      ["My contribution", "I developed the website frontend as part of the Puru Software Agency team. The work is presented as a team delivery, with my contribution focused on the interface."],
      ["What shipped", "The interface includes a game catalogue, product selection, account detail entry, support information, and clear calls to start a top-up."],
    ],
  },
] as const;

export const experience = [
  { name: "Institut Teknologi Garut", role: "Junior Software Engineer · Fullstack", date: "APR 2026 — PRESENT", image: "/porto-v2/itg-logo.png", text: "Working with the Digitalization, Technology and Information Systems team on new systems, features, and maintenance. My focus is web frontend and mobile development, alongside fullstack work and growing involvement in DevOps and server operations.", links: [["WEBSITE", "https://itg.ac.id"], ["LINKEDIN", "https://www.linkedin.com/school/institut-teknologi-garut"]] },
  { name: "Puru Software Agency", role: "Founder & CTO · Project Manager · Frontend Developer", date: "JUL 2026 — PRESENT", image: "/porto-v2/puru-logo.svg", text: "Coordinating client projects and building frontend interfaces with the team, especially UI/UX designers and system analysts. I also work across the wider delivery team and with clients.", links: [["LINKEDIN", "https://www.linkedin.com/company/puru-software-agency/"]] },
  { name: "Sakode Academy", role: "Founder · Operations Lead", date: "MAY 2026 — PRESENT", image: "/porto-v2/sakode-logo.png", text: "Building a coding academy for children and coordinating marketing, technology development, and learning-path teams. This organization role is separate from my frontend contribution to its public website.", links: [["WEBSITE", "https://sakode.com"], ["LINKEDIN", "https://www.linkedin.com/company/sakode-academy/"]] },
  { name: "AyaWarta", role: "Founder · Manager · Developer · Designer", date: "LATE 2025 / RELAUNCHED SEP 2026", image: "/porto-v2/ayawarta-logo.png", text: "Started a digital and print invitation venture in late 2025. After a pause, it relaunched in September 2026 as a Puru Software Agency sub-business. I manage the work and contribute to invitation systems and design.", links: [["WEBSITE", "https://ayawarta.my.id"]] },
  { name: "DIGITAK / PT Metanouva Informatika", role: "Frontend Developer · Work Placement", date: "AUG — SEP 2025", image: "/porto-v2/digitak-logo.svg", text: "During a two-month placement, I developed the frontend of a project management system for coordinating work and tasks.", links: [["WEBSITE", "https://digitak.id"]] },
] as const;

export const credentialGroups = [
  { label: "CERTIFICATIONS & ASSESSMENT", items: [
    ["IT Specialist — Data Analytics", "Certiport / Pearson VUE", "https://www.credly.com/badges/3febb364-36fc-4d37-b2d9-26e432c258d8"],
    ["Gemini Certified University Student", "Google for Education", "https://www.credential.net/43475962-9c38-4545-b26a-c413cbbdbbb5"],
    ["Gemini Certified Educator", "Google for Education", "https://www.credential.net/bdcdcd7e-595f-4d5d-a131-b4f74fffc12f"],
    ["EnglishScore", "British Council", ""],
  ] },
  { label: "CLOUD SKILL BADGES", items: [
    ["Build Real World AI Applications with Gemini and Imagen", "Google Cloud", "https://www.skills.google/public_profiles/fff275a1-614b-4042-b5af-76f9d5328154/badges/13919927"],
    ["Implement Speech and Language Solutions with Pre-trained APIs", "Google Cloud", "https://www.skills.google/public_profiles/fff275a1-614b-4042-b5af-76f9d5328154/badges/13928135"],
    ["Prepare Data for ML APIs on Google Cloud", "Google Cloud", "https://www.skills.google/public_profiles/fff275a1-614b-4042-b5af-76f9d5328154/badges/13955153"],
    ["Prompt Design in Agent Platform", "Google Cloud", "https://www.skills.google/public_profiles/fff275a1-614b-4042-b5af-76f9d5328154/badges/13883661"],
    ["Secure BigLake Data", "Google Cloud", "https://www.skills.google/public_profiles/fff275a1-614b-4042-b5af-76f9d5328154/badges/13964992"],
    ["The Basics of Google Cloud Compute", "Google Cloud", "https://www.skills.google/public_profiles/fff275a1-614b-4042-b5af-76f9d5328154/badges/13956259"],
  ] },
  { label: "LEARNING MODULES", items: [
    "Get started with AI-powered information extraction in Azure", "Introduction to AI-powered information extraction concepts", "Get started with computer vision in Azure", "Introduction to computer vision concepts", "Get started with speech in Azure", "Get started with natural language processing in Azure", "Introduction to natural language processing concepts", "Get started with generative AI in Azure", "Introduction to generative AI concepts", "Get started with machine learning in Azure", "Fundamentals of Azure AI services", "Introduction to machine learning",
  ].map(title => [title, "Microsoft Learn", "https://learn.microsoft.com/en-us/users/yogaagustiansyah-1326/"]) },
  { label: "COMPLETED COURSES", items: [
    ["Flutter Mobile App Development", "Candradimuka Jabar Coding Camp", ""],
    ["React Native Mobile App Development", "Candradimuka Jabar Coding Camp", ""],
    ["Belajar Dasar Visualisasi Data", "Dicoding", "https://www.dicoding.com/certificates/MRZME683LPYQ"],
    ["Memulai Pemrograman dengan Python", "Dicoding", "https://www.dicoding.com/certificates/MEPJ22VQLP3V"],
    ["Financial Literacy 101", "Dicoding", ""],
    ["Belajar Dasar Data Science", "Dicoding", "https://www.dicoding.com/certificates/6RPNG0NY8Z2M"],
  ] },
] as const;
