const schemes = [

  // ================================
  // 🎓 EDUCATION DEPARTMENT
  // ================================
  {
    name: "Pudhumai Penn Scheme",
    category: "Education",
    gender: "female",
    age: "student",
    qualification: "hsc",
    income: "low",
    community: "all",
    description: "₹1,000 monthly scholarship for girl students pursuing higher education.",
    benefits: "Financial support till UG completion.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },
  {
    name: "Tamil Pudhalvan Scheme",
    category: "Education",
    gender: "male",
    age: "student",
    qualification: "ug",
    income: "all",
    community: "all",
    description: "Scholarship scheme for boys pursuing higher education.",
    benefits: "Financial aid for higher education.",
    deadline: "Ongoing",
    link: "https://www.tnsocialwelfare.tn.gov.in/"
  },
  {
    name: "Illam Thedi Kalvi",
    category: "Education",
    gender: "all",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Doorstep education by volunteers to bridge learning gaps.",
    benefits: "Improved learning outcomes.",
    deadline: "Ongoing",
    link: "https://illamthedikalvi.tnschools.gov.in"
  },
  {
    name: "Naan Mudhalvan",
    category: "Education",
    gender: "all",
    age: "student",
    qualification: "hsc",
    income: "all",
    community: "all",
    description: "Skill development & career guidance for youth.",
    benefits: "Career counseling, coding, soft skills.",
    deadline: "Ongoing",
    link: "https://naanmudhalvan.tn.gov.in"
  },
  {
    name: "Chief Minister's Breakfast Scheme",
    category: "Education",
    gender: "all",
    age: "student",
    qualification: "all",
    income: "low",
    community: "all",
    description: "Nutritious breakfast for primary school children.",
    benefits: "Improved attendance & nutrition.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },

  // ================================
  // 👩‍🦰 WOMEN & SOCIAL WELFARE
  // ================================
  {
    name: "Kalaignar Magalir Urimai Thogai",
    category: "Women",
    gender: "female",
    age: "adult",
    qualification: "all",
    income: "low",
    community: "all",
    description: "₹1,000 monthly aid to eligible women heads of families.",
    benefits: "Direct monthly transfer.",
    deadline: "Ongoing",
    link: "https://kmut.tn.gov.in"
  },
  {
    name: "Magalir Thittam (Rural Livelihoods)",
    category: "Women",
    gender: "female",
    age: "adult",
    qualification: "all",
    income: "low",
    community: "all",
    description: "Empowers rural women via SHGs, training, credit.",
    benefits: "Self-employment opportunities.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },
  {
    name: "Moovalur Ramamirtham Ammaiyar Scheme",
    category: "Women",
    gender: "female",
    age: "student",
    qualification: "hsc",
    income: "all",
    community: "all",
    description: "Scholarship for higher education of girl students.",
    benefits: "Financial aid till completion.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },

  // ================================
  // 🏥 HEALTH & FAMILY WELFARE
  // ================================
  {
    name: "Chief Minister Health Insurance Scheme",
    category: "Health",
    gender: "all",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Free health insurance for poor families.",
    benefits: "Cashless hospital treatment in empanelled hospitals.",
    deadline: "Ongoing",
    link: "https://www.cmchistn.com/"
  },
  {
    name: "Dr. Muthulakshmi Reddy Maternity Benefit",
    category: "Health",
    gender: "female",
    age: "adult",
    qualification: "all",
    income: "low",
    community: "all",
    description: "Financial assistance for pregnant women.",
    benefits: "Cash support for maternal care.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },

  // ================================
  // 👩‍💼 JOBS & EMPLOYMENT
  // ================================
  {
    name: "TNPSC Recruitment Portal",
    category: "Jobs",
    gender: "all",
    age: "adult",
    qualification: "ug",
    income: "all",
    community: "all",
    description: "Apply for Group I, II, IV, VAO, etc.",
    benefits: "Permanent state govt jobs.",
    deadline: "As per notification",
    link: "https://apply.tnpscexams.in"
  },
  {
    name: "Teachers Recruitment Board (TRB)",
    category: "Jobs",
    gender: "all",
    age: "adult",
    qualification: "pg",
    income: "all",
    community: "all",
    description: "Recruitment for teachers & lecturers in govt institutions.",
    benefits: "Secure govt teaching jobs.",
    deadline: "As per notification",
    link: "https://trb.tn.gov.in/"
  },
  {
    name: "TNUSRB Police Recruitment",
    category: "Jobs",
    gender: "all",
    age: "adult",
    qualification: "sslc",
    income: "all",
    community: "all",
    description: "Recruitment for Police Constables, SI, Firemen.",
    benefits: "Uniformed services jobs.",
    deadline: "Refer TNUSRB notifications",
    link: "https://tnusrb.tn.gov.in/"
  },
  {
    name: "TN MRB (Medical Recruitment Board)",
    category: "Jobs",
    gender: "all",
    age: "adult",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Recruitment for nurses, doctors, lab technicians.",
    benefits: "Govt health sector jobs.",
    deadline: "Ongoing",
    link: "https://www.mrb.tn.gov.in/"
  },
  {
    name: "TN Employment Exchange",
    category: "Jobs",
    gender: "all",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Register & renew for govt/private jobs.",
    benefits: "Find suitable opportunities.",
    deadline: "Ongoing",
    link: "https://tnvelaivaaippu.gov.in/Empower/"
  },
  {
    name: "TN Private Jobs Portal",
    category: "Jobs",
    gender: "all",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Search private sector job openings.",
    benefits: "Wide career options.",
    deadline: "Ongoing",
    link: "https://www.tnprivatejobs.tn.gov.in/Home/jobs"
  },
  {
    name: "TNEB AE/JE Recruitment",
    category: "Jobs",
    gender: "all",
    age: "adult",
    qualification: "ug",
    income: "all",
    community: "all",
    description: "Assistant Engineer & Junior Engineer recruitment under TANGEDCO.",
    benefits: "Electricity Board govt jobs.",
    deadline: "As per notification",
    link: "https://www.tangedco.gov.in/"
  },
  {
    name: "TNRD Panchayat Secretary Recruitment",
    category: "Jobs",
    gender: "all",
    age: "adult",
    qualification: "hsc",
    income: "all",
    community: "all",
    description: "Recruitment for panchayat secretaries & rural posts.",
    benefits: "Rural development jobs.",
    deadline: "As per notification",
    link: "https://www.tnrd.tn.gov.in/"
  },

  // ================================
  // 🌱 AGRICULTURE DEPARTMENT
  // ================================
  {
    name: "Kudimaramathu Scheme",
    category: "Agriculture",
    gender: "all",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Restoration of tanks and lakes in TN.",
    benefits: "Improves irrigation & water storage.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },
  {
    name: "Micro Irrigation Subsidy",
    category: "Agriculture",
    gender: "all",
    age: "adult",
    qualification: "all",
    income: "all",
    community: "all",
    description: "100% subsidy for drip/sprinkler irrigation for small farmers.",
    benefits: "Efficient irrigation methods.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },
  {
    name: "Seed Village Programme",
    category: "Agriculture",
    gender: "all",
    age: "adult",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Distribution of quality seeds at subsidized rates.",
    benefits: "Affordable seeds for farmers.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },

  // ================================
  // 🌳 ENVIRONMENT
  // ================================
  {
    name: "Green Tamil Nadu Mission",
    category: "Environment",
    gender: "all",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Mission to increase Tamil Nadu’s forest cover to 33%.",
    benefits: "Environmental restoration.",
    deadline: "Ongoing",
    link: "https://www.greentnmission.com"
  },

  // ================================
  // 🏠 HOUSING & URBAN DEVELOPMENT
  // ================================
  {
    name: "Kalaignarin Kanavu Illam",
    category: "Housing",
    gender: "all",
    age: "adult",
    qualification: "all",
    income: "low",
    community: "all",
    description: "Free permanent houses for rural poor families.",
    benefits: "Improved housing facilities.",
    deadline: "Varies",
    link: "https://www.tn.gov.in/"
  },

  // ================================
  // 💍 MARRIAGE WELFARE
  // ================================
  {
    name: "Intercaste Marriage Assistance",
    category: "Marriage",
    gender: "all",
    age: "adult",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Financial aid for intercaste marriages.",
    benefits: "Cash assistance for couples.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },
  {
    name: "Widow Remarriage Assistance",
    category: "Marriage",
    gender: "female",
    age: "adult",
    qualification: "all",
    income: "low",
    community: "all",
    description: "Financial help for remarriage of widows.",
    benefits: "Cash support.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },

  // ================================
  // 🚌 TRANSPORT
  // ================================
  {
    name: "Zero-Ticket Bus for Women",
    category: "Transport",
    gender: "female",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Free bus travel for women in TNSTC buses.",
    benefits: "Cost-free daily commute.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  },

  // ================================
  // 🎁 WELFARE
  // ================================
  {
    name: "Pongal Gift Scheme",
    category: "Welfare",
    gender: "all",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Seasonal welfare assistance during Pongal festival.",
    benefits: "Gift items/financial aid.",
    deadline: "Annual before Pongal",
    link: "https://www.tn.gov.in/"
  },
  {
    name: "Sports Kit for Students",
    category: "Welfare",
    gender: "all",
    age: "student",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Distribution of free sports kits to students.",
    benefits: "Encourages sports participation.",
    deadline: "Annual",
    link: "https://www.tn.gov.in/"
  },

  // ================================
  // 🏗 INFRASTRUCTURE
  // ================================
  {
    name: "Urban Development Mission",
    category: "Infrastructure",
    gender: "all",
    age: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Integrated urban infrastructure projects across TN.",
    benefits: "Better civic amenities.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/"
  }

];
