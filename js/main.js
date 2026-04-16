// ==================== PAGE NAVIGATION ====================
window.showPage = function (id, el) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  const targetPage = document.getElementById('page-' + id);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
  });

  if (el) {
    el.classList.add('active');
  }

  const topEl = document.getElementById('top');
  if (topEl) {
    topEl.scrollIntoView({ behavior: 'auto' });
  }

  // Initialize dynamic pages when opened
  if (id === 'papers') {
    initPapersPage();
  }

  if (id === 'software') {
    initSoftwarePage();
  }
};

window.switchTab = function (id, el) {
  const main = el.closest('.main');
  const tabs = el.closest('.tabs');
  if (!main || !tabs) return;

  tabs.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  main.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  const target = document.getElementById(id);
  if (target) target.classList.add('active');

  el.classList.add('active');
};

// ==================== QUESTION PAPERS DATA ====================
const papersDatabase = {
  "Bachelor of Engineering in Mechanical Engineering(BE4ME)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Thermodynamics", downloadLink: "#", code: "ME301" },
      { semester: "Autumn", year: "2023", subject: "Fluid Mechanics", downloadLink: "#", code: "ME203" },
      { semester: "Spring", year: "2024", subject: "Machine Design", downloadLink: "#", code: "ME402" },
      { semester: "Spring", year: "2023", subject: "Heat Transfer", downloadLink: "#", code: "ME305" },
      { semester: "Autumn", year: "2022", subject: "Manufacturing Processes", downloadLink: "#", code: "ME102" }
    ]
  },
  "Bachelor of Engineering in Surveying and Geo-information(BE4SG)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Geodesy", downloadLink: "#", code: "SG401" },
      { semester: "Autumn", year: "2023", subject: "Remote Sensing", downloadLink: "#", code: "SG302" },
      { semester: "Spring", year: "2024", subject: "GIS Fundamentals", downloadLink: "#", code: "SG204" }
    ]
  },
  "Diploma in Civil Engineering(DCE)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Surveying", downloadLink: "#", code: "CE101" },
      { semester: "Spring", year: "2024", subject: "Construction Materials", downloadLink: "#", code: "CE102" },
      { semester: "Autumn", year: "2023", subject: "Structural Analysis", downloadLink: "#", code: "CE201" }
    ]
  },
  "Diploma in Electrical Engineering(DEE)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Circuit Theory", downloadLink: "#", code: "EE101" },
      { semester: "Spring", year: "2024", subject: "Electrical Machines", downloadLink: "#", code: "EE202" },
      { semester: "Autumn", year: "2023", subject: "Power Systems", downloadLink: "#", code: "EE301" }
    ]
  },
  "Diploma in Mechanical Engineering(DME)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Engineering Drawing", downloadLink: "#", code: "ME101" },
      { semester: "Spring", year: "2024", subject: "Workshop Technology", downloadLink: "#", code: "ME102" }
    ]
  },
  "Diploma in Electronics and Communication Engineering(DECE)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Analog Electronics", downloadLink: "#", code: "EC101" },
      { semester: "Spring", year: "2024", subject: "Digital Electronics", downloadLink: "#", code: "EC102" }
    ]
  },
  "Diploma in Surveying(DS)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Plane Surveying", downloadLink: "#", code: "SV101" },
      { semester: "Spring", year: "2024", subject: "Levelling", downloadLink: "#", code: "SV102" }
    ]
  },
  "Diploma in Computer System and Network(DCSN)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Computer Networks", downloadLink: "#", code: "CN201" },
      { semester: "Spring", year: "2024", subject: "Operating Systems", downloadLink: "#", code: "OS202" },
      { semester: "Autumn", year: "2023", subject: "Data Structures", downloadLink: "#", code: "DS101" },
      { semester: "Spring", year: "2023", subject: "Database Management", downloadLink: "#", code: "DB102" }
    ]
  },
  "Diploma in Multimedia and Animation(DMA)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "2D Animation", downloadLink: "#", code: "MA101" },
      { semester: "Spring", year: "2024", subject: "Graphic Design", downloadLink: "#", code: "MA102" },
      { semester: "Autumn", year: "2023", subject: "Video Editing", downloadLink: "#", code: "MA201" }
    ]
  },
  "Diploma in Materials and Procurement Management(DMPM)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Supply Chain Management", downloadLink: "#", code: "PM101" },
      { semester: "Spring", year: "2024", subject: "Inventory Control", downloadLink: "#", code: "PM102" }
    ]
  },
  "Diploma in Construction and Supervision(DCS)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "Construction Planning", downloadLink: "#", code: "CS101" },
      { semester: "Spring", year: "2024", subject: "Site Supervision", downloadLink: "#", code: "CS102" }
    ]
  },
  "Diploma in Mechanical, Electrical and Plumbing(DMEP)": {
    papers: [
      { semester: "Autumn", year: "2024", subject: "HVAC Systems", downloadLink: "#", code: "MEP101" },
      { semester: "Spring", year: "2024", subject: "Plumbing Design", downloadLink: "#", code: "MEP102" }
    ]
  }
};

let currentSelectedCourse = null;
let papersPageInitialized = false;

function populateCourseList() {
  const container = document.getElementById('course-list-container');
  if (!container) return;

  container.innerHTML = '';
  const courses = Object.keys(papersDatabase);

  courses.forEach(course => {
    const courseDiv = document.createElement('div');
    courseDiv.className = 'course-item';
    courseDiv.innerHTML = `<i class="fa-solid fa-graduation-cap" style="margin-right: 10px;"></i>${course}`;
    courseDiv.addEventListener('click', () => selectCourse(course));
    container.appendChild(courseDiv);
  });
}

function selectCourse(courseName) {
  currentSelectedCourse = courseName;

  const coursesView = document.getElementById('courses-view');
  const papersView = document.getElementById('papers-view');

  if (coursesView) coursesView.style.display = 'none';
  if (papersView) {
    papersView.style.display = 'block';
    papersView.classList.add('active');
  }

  const semesterFilter = document.getElementById('semester-filter');
  const yearFilter = document.getElementById('year-filter');

  if (semesterFilter) semesterFilter.value = 'all';
  populateYearDropdown();
  if (yearFilter) yearFilter.value = 'all';

  renderPapers();
}

function populateYearDropdown() {
  const yearSelect = document.getElementById('year-filter');
  if (!yearSelect) return;

  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = '<option value="all">All Years</option>';

  for (let y = 2020; y <= currentYear + 1; y++) {
    const option = document.createElement('option');
    option.value = String(y);
    option.textContent = String(y);
    yearSelect.appendChild(option);
  }
}

function renderPapers() {
  if (!currentSelectedCourse) return;

  const courseData = papersDatabase[currentSelectedCourse];
  if (!courseData) return;

  const semesterFilter = document.getElementById('semester-filter')?.value || 'all';
  const yearFilter = document.getElementById('year-filter')?.value || 'all';

  let filteredPapers = [...courseData.papers];

  if (semesterFilter !== 'all') {
    filteredPapers = filteredPapers.filter(p => p.semester === semesterFilter);
  }

  if (yearFilter !== 'all') {
    filteredPapers = filteredPapers.filter(p => p.year === yearFilter);
  }

  filteredPapers.sort((a, b) => {
    if (a.year !== b.year) return Number(b.year) - Number(a.year);
    if (a.semester === b.semester) return 0;
    return a.semester === 'Autumn' ? -1 : 1;
  });

  const container = document.getElementById('papers-content');
  if (!container) return;

  if (filteredPapers.length === 0) {
    container.innerHTML = `
      <div class="no-papers">
        <i class="fa-solid fa-file-circle-exclamation" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
        No question papers found for the selected filters.
      </div>
    `;
    return;
  }

  let tableHTML = `
    <div class="papers-table">
      <table>
        <thead>
          <tr>
            <th>Subject Code</th>
            <th>Subject Name</th>
            <th>Semester</th>
            <th>Year</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  filteredPapers.forEach(paper => {
    tableHTML += `
      <tr>
        <td><strong>${paper.code}</strong></td>
        <td>${paper.subject}</td>
        <td>
          <span style="background: ${paper.semester === 'Autumn' ? '#fef3c7' : '#dbeafe'}; padding: 2px 8px; border-radius: 20px; font-size: 11px;">
            ${paper.semester}
          </span>
        </td>
        <td>${paper.year}</td>
        <td>
          <button class="download-paper-btn"
            onclick='downloadPaper(${JSON.stringify(paper.subject)}, ${JSON.stringify(paper.year)}, ${JSON.stringify(paper.semester)})'>
            <i class="fa-solid fa-download"></i> Download
          </button>
        </td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}

window.downloadPaper = function (subject, year, semester) {
  if (!currentSelectedCourse) return;

  const courseMatch = currentSelectedCourse.match(/\(([^)]+)\)/);
  const courseCode = courseMatch ? courseMatch[1] : "General";
  const safeFileName = subject.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') + ".pdf";

  // Uses current host automatically
  const serverHost = window.location.hostname || "localhost";
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const downloadUrl = `${protocol}//${serverHost}/repository/${courseCode}/${year}/${semester}/${safeFileName}`;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', safeFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("Attempting download from:", downloadUrl);
};

function setupBackButton() {
  const backBtn = document.getElementById('back-to-courses');
  if (!backBtn) return;

  backBtn.onclick = () => {
    const papersView = document.getElementById('papers-view');
    const coursesView = document.getElementById('courses-view');

    if (papersView) {
      papersView.style.display = 'none';
      papersView.classList.remove('active');
    }

    if (coursesView) {
      coursesView.style.display = 'block';
    }

    currentSelectedCourse = null;
  };
}

function setupFilterListeners() {
  const semesterFilter = document.getElementById('semester-filter');
  const yearFilter = document.getElementById('year-filter');

  if (semesterFilter) {
    semesterFilter.onchange = renderPapers;
  }

  if (yearFilter) {
    yearFilter.onchange = renderPapers;
  }
}

function initPapersPage() {
  if (!document.getElementById('courses-view')) return;

  populateCourseList();
  setupBackButton();
  setupFilterListeners();

  const papersView = document.getElementById('papers-view');
  const coursesView = document.getElementById('courses-view');

  if (papersView) {
    papersView.style.display = 'none';
    papersView.classList.remove('active');
  }

  if (coursesView) {
    coursesView.style.display = 'block';
  }

  currentSelectedCourse = null;
  papersPageInitialized = true;
}

// ==================== SOFTWARE FILE EXPLORER ====================

// Helper: convert display folder name to a safe key
function folderNameToKey(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

const softwareFileSystem = {
  root: [
    { name: "Activator", size: "78.5 MB", modified: "3 years ago", type: "folder" },
    { name: "Archiver", size: "5.5 MB", modified: "5 years ago", type: "folder" },
    { name: "Dzongkha Unicodes", size: "627 MB", modified: "5 years ago", type: "folder" },
    { name: "EasyMP", size: "39.2 MB", modified: "3 years ago", type: "folder" },
    { name: "Engineering Softwares", size: "67.9 GB", modified: "2 months ago", type: "folder" },
    { name: "Interactive Board (Airgo Cast)", size: "34.1 MB", modified: "2 months ago", type: "folder" },
    { name: "Miss", size: "1.2 GB", modified: "3 years ago", type: "folder" },
    { name: "Office", size: "6.9 GB", modified: "2 months ago", type: "folder" },
    { name: "OS", size: "18.5 GB", modified: "4 years ago", type: "folder" },
    { name: "Partitioner", size: "65.3 MB", modified: "4 years ago", type: "folder" },
    { name: "Recovery Tools", size: "1.6 GB", modified: "4 years ago", type: "folder" }
  ],
  activator: [
    { name: "Ratiborus KMS Tools v10.02.2021", size: "53.5 MB", modified: "5 years ago", type: "folder" },
  
    { name: "KMSAuto_Portable_v1.5.7.zip", size: "15.8 MB", modified: "5 years ago", type: "zip" },
    { name: "KMSOffline 2.3.1.zip", size: "6.7 MB", modified: "5 years ago", type: "zip" },
    { name: "Office 2019 KMS Activator Ultimate 1.2.zip", size: "2.5 MB", modified: "5 years ago", type: "zip" },
    { name: "Readme.md", size: "< 1 KB", modified: "5 years ago", type: "file" }
  ],
  ratiborus_kms_tools_v10022021: [
    { name: "KMS Tools v10.02.2021 {CracksHash}.zip", size: "53.5 MB", modified: "5 years ago", type: "zip" }
  ],
  
  archiver: [
    { name: "Readme.md", size: "< 1 KB", modified: "5 years ago", type: "file" },
    { name: "WinRAR v5.71 (x86, x64) + Key [4REALTORRENTZ.COM].ZIP", size: "5.5 MB", modified: "7 years ago", type: "zip" }
  ],
 dzongkha_unicodes: [
    { name: "Dzongkha Unicode", size: "36.9 MB", modified: "5 years ago", type: "folder" },
    { name: "Latest_2021", size: "7.5 MB", modified: "5 years ago", type: "folder" },
    { name: "Dzongkha Unicode 2010.rar", size: "568.9 MB", modified: "5 years ago", type: "zip" },
    { name: "Dzongkha_Unicode_Latest.rar", size: "13.7 MB", modified: "5 years ago", type: "zip" }
  ],
  easymp: [
    { name: "EasyMP-Windows.exe", size: "15.8 MB", modified: "5 years ago", type: "file" },
    { name: "epson16189.exe", size: "15.8 MB", modified: "5 years ago", type: "file" },
    { name: "epson16807-Mac.dmg", size: "3.8 MB", modified: "5 years ago", type: "file" },
    { name: "epson16807.dmg", size: "3.8 MB", modified: "3 years ago", type: "file" }
  ],
  engineering_softwares: [
    { name: "AUTOCAD", size: "9.6 GB", modified: "2 months ago", type: "folder" },
    { name: "CST Studio", size: "3.1 GB", modified: "4 years ago", type: "folder" },
    { name: "ETAP", size: "4.1 GB", modified: "4 years ago", type: "folder" },
    { name: "LISCAD", size: "77.2 MB", modified: "5 years ago", type: "folder" },
    { name: "MATLAB", size: "32.2 GB", modified: "3 years ago", type: "folder" },
    { name: "MultiSIM", size: "856.1 MB", modified: "5 years ago", type: "folder" },
    { name: "OpenFoam", size: "588.2 MB", modified: "3 years ago", type: "folder" },
    { name: "Proteus", size: "397.4 MB", modified: "5 years ago", type: "folder" },
    { name: "SketchUp", size: "1.7 GB", modified: "3 years ago", type: "folder" },
    { name: "SolidWorks", size: "15.4 GB", modified: "4 years ago", type: "folder" }
  ],
  interactive_board_airgo_cast: [
    { name: "AirgoCast_MacOS_v2.10.2.pkg", size: "9.5 MB", modified: "2 months ago", type: "file" },
    { name: "AirgoCastWindows_v2.10.1.403.20240824.exe", size: "24.6 MB", modified: "2 months ago", type: "exe" }
  ],
  miss: [
    { name: "Camtasia Studio 2019.rar", size: "489.2 MB", modified: "5 years ago", type: "zip" },
    { name: "Nitro Pro 11.0.5.270.zip", size: "270.7 MB", modified: "9 years ago", type: "zip" },
    { name: "SolarWinds-Freetools-MS-Mini-Utilities-2021.3.0.121.zip", size: "4.9 MB", modified: "4 years ago", type: "zip" },
    { name: "Tally ERP 9.0 + Crack [ Team MJY ].rar", size: "20.2 MB", modified: "6 years ago", type: "zip" },
    { name: "TechSmith Camtasia v2021.0.15.rar", size: "472.9 MB", modified: "4 years ago", type: "zip" }
  ],
   office: [
    { name: "Microsoft Office 2024 with crack.zip", size: "5.1 GB", modified: "2 months ago", type: "zip" },
    { name: "Office ProPlus 2021 en-US x64 New.rar", size: "1.8 GB", modified: "2 years ago", type: "zip" }
  ],
  os: [
    { name: "Windows Server", size: "3.9 GB", modified: "4 years ago", type: "folder" },
    { name: "rufus-3.13.exe", size: "1.1 MB", modified: "5 years ago", type: "exe" },
    { name: "SRV2016.STD.ENU.MAR2020.iso", size: "4.4 GB", modified: "6 years ago", type: "file" },
    { name: "WIN7PRO.ENU.MAY2021.iso", size: "3.4 GB", modified: "5 years ago", type: "file" },
    { name: "Windows 10 Pro x64 en-US Activated.iso", size: "3.4 GB", modified: "6 years ago", type: "file" },
    { name: "Windows Password Recovery Tool Ultimate 7.1.2.3 + Crack.rar", size: "221.3 MB", modified: "5 years ago", type: "zip" },
    { name: "Windows Pro x64.ISO", size: "3.1 GB", modified: "5 years ago", type: "file" }
  ],
  partitioner: [
    { name: "pw11-free-offline.exe", size: "65.3 MB", modified: "5 years ago", type: "exe" },
    { name: "Readme.md", size: "< 1 KB", modified: "4 years ago", type: "file" }
  ],
  recovery_tools: [
    { name: "PC_Unlocker", size: "1.4 GB", modified: "5 years ago", type: "folder" },
    { name: "dotnetfx35.exe", size: "231.5 MB", modified: "4 years ago", type: "exe" },
    { name: "EaseUS Data Recovery Wizard Technician 10.2.0 + Keygen [SadeemPC].zip", size: "14.6 MB", modified: "8 years ago", type: "zip" },
    { name: "Stellar Phoenix Windows Data Recovery Professional 7.0.0.0 + Crack.zip", size: "23.3 MB", modified: "8 years ago", type: "zip" }
  ],

};


let currentFolder = 'root';
let currentFolderDisplayName = '';
let folderStack = [];

function renderSoftwareTable() {
  const container = document.querySelector('#page-software .main');
  if (!container) return;

  const items = softwareFileSystem[currentFolder] || [];
  const isRoot = currentFolder === 'root';

  let breadcrumbHTML = `
    <span class="breadcrumb-item link" onclick="navigateToFolder('root', '')">
      <i class="fa-solid fa-house"></i>
    </span>
  `;

  folderStack.forEach((entry, idx) => {
    breadcrumbHTML += `<span class="breadcrumb-sep">&rsaquo;</span>`;
    if (idx < folderStack.length - 1) {
      breadcrumbHTML += `<span class="breadcrumb-item link" onclick="navigateToStackIndex(${idx})">${entry.displayName}</span>`;
    } else {
      breadcrumbHTML += `<span class="breadcrumb-item">${entry.displayName}</span>`;
    }
  });

  const folderCount = items.filter(item => item.type === 'folder').length;
  const fileCount = items.filter(item => item.type !== 'folder').length;

  let sizeLabel = '';
  if (isRoot) {
    sizeLabel = '97.5 GB';
  } else {
    const rootItem = softwareFileSystem.root.find(item => folderNameToKey(item.name) === currentFolder);
    sizeLabel = rootItem ? rootItem.size : '';
  }

  const summaryParts = [];
  if (folderCount > 0) summaryParts.push(`${folderCount} ${folderCount === 1 ? 'folder' : 'folders'}`);
  if (fileCount > 0) summaryParts.push(`${fileCount} ${fileCount === 1 ? 'file' : 'files'}`);

  const summary = summaryParts.length > 0
    ? `${summaryParts.join(' and ')}${sizeLabel ? `   ${sizeLabel}` : ''}`
    : `Empty folder${sizeLabel ? `   ${sizeLabel}` : ''}`;

  let rowsHTML = '';

  items.forEach(item => {
    let icon = '';
    let rowClass = '';
    let clickAction = '';

    if (item.type === 'folder') {
      icon = '<i class="fa-solid fa-folder folder-icon"></i>';
      rowClass = 'clickable-row';
      const key = folderNameToKey(item.name);
      const safeName = item.name.replace(/'/g, "\\'");
      clickAction = `onclick="navigateToFolder('${key}', '${safeName}')"`;
    } else if (item.type === 'zip') {
      icon = '<i class="fa-solid fa-file-zipper" style="color:#0078d4; margin-right:12px; font-size:18px;"></i>';
    } else {
      icon = '<i class="fa-solid fa-file-lines file-icon-gray"></i>';
    }

    rowsHTML += `
      <tr class="${rowClass}" ${clickAction}>
        <td class="check-col"><div class="custom-checkbox"></div></td>
        <td>${icon}${item.name}</td>
        <td class="size-col">${item.size}</td>
        <td class="date-col">${item.modified}</td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="file-explorer-container">
      <div class="file-breadcrumb">
        ${breadcrumbHTML}
      </div>
      <table class="file-table">
        <thead>
          <tr>
            <th class="check-col"><div class="custom-checkbox"></div></th>
            <th>Name &nbsp;<i class="fa-solid fa-arrow-up" style="font-size:10px;"></i></th>
            <th style="text-align:right">Size</th>
            <th style="text-align:right">Modified</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
      <div class="file-footer">${summary}</div>
    </div>
  `;
}

window.navigateToFolder = function (folderKey, displayName) {
  if (folderKey === 'root') {
    currentFolder = 'root';
    currentFolderDisplayName = '';
    folderStack = [];
    renderSoftwareTable();
    return;
  }

  currentFolder = folderKey;
  currentFolderDisplayName = displayName;

  const existingIndex = folderStack.findIndex(entry => entry.key === folderKey);
  if (existingIndex !== -1) {
    folderStack = folderStack.slice(0, existingIndex + 1);
  } else {
    folderStack.push({ key: folderKey, displayName });
  }

  if (softwareFileSystem[folderKey] === undefined) {
    softwareFileSystem[folderKey] = [];
  }

  renderSoftwareTable();
};

window.navigateToStackIndex = function (idx) {
  const entry = folderStack[idx];
  if (!entry) return;

  folderStack = folderStack.slice(0, idx + 1);
  currentFolder = entry.key;
  currentFolderDisplayName = entry.displayName;
  renderSoftwareTable();
};

function initSoftwarePage() {
  currentFolder = 'root';
  currentFolderDisplayName = '';
  folderStack = [];
  renderSoftwareTable();
}

// ==================== CONTACT PAGE ====================
function setupContactForm() {
  const sendBtn = document.querySelector('#page-contact .btn-submit');
  if (!sendBtn) return;

  sendBtn.onclick = function () {
    const name = document.querySelector('#page-contact input[type="text"]')?.value.trim() || '';
    const email = document.querySelector('#page-contact input[type="email"]')?.value.trim() || '';
    const textarea = document.querySelector('#page-contact textarea')?.value.trim() || '';

    if (!name || !email || !textarea) {
      alert("Please fill in all the fields before sending your message.");
      return;
    }

    alert("Thank you for contacting JNEC Digital Repository. Your message has been received.");
  };
}

// ==================== INITIAL LOAD ====================
document.addEventListener('DOMContentLoaded', () => {
  // If papers page is active on load
  const papersPage = document.getElementById('page-papers');
  if (papersPage && papersPage.classList.contains('active')) {
    initPapersPage();
  }

  // If software page is active on load
  const softwarePage = document.getElementById('page-software');
  if (softwarePage && softwarePage.classList.contains('active')) {
    initSoftwarePage();
  }

  setupContactForm();
});
