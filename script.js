function logout() {
  localStorage.removeItem("loggedInType");
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

function toggleRegisterForm() {
  const type = document.getElementById("registerType").value;
  document.getElementById("studentRegisterForm").style.display = type === "student" ? "block" : "none";
  document.getElementById("companyRegisterForm").style.display = type === "company" ? "block" : "none";
}

if (document.getElementById("studentRegisterForm")) {
  document.getElementById("studentRegisterForm").onsubmit = function (e) {
    e.preventDefault();
    const newStudent = {
      name: document.getElementById("studentName").value,
      email: document.getElementById("studentEmail").value,
      index: document.getElementById("studentIndexNumber").value,
      password: document.getElementById("studentPassword").value,
      studentIdPic: ""
    };
    const fileInput = document.getElementById("studentIdPic");
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        newStudent.studentIdPic = evt.target.result;
        saveStudent(newStudent);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      alert("Please upload your Student ID picture.");
    }
  };
}

function saveStudent(newStudent) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  if (students.some(s => s.email === newStudent.email)) {
    alert("Email already registered.");
    return;
  }
  students.push(newStudent);
  localStorage.setItem("students", JSON.stringify(students));
  alert("Registration successful! Please log in.");
  window.location.href = "login.html";
}

if (document.getElementById("companyRegisterForm")) {
  document.getElementById("companyRegisterForm").onsubmit = function (e) {
    e.preventDefault();
    const newCompany = {
      name: document.getElementById("companyName").value,
      email: document.getElementById("companyEmail").value,
      password: document.getElementById("companyPassword").value,
      permitFile: ""
    };
    const fileInput = document.getElementById("companyPermitFile");
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        newCompany.permitFile = evt.target.result;
        saveCompany(newCompany);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      alert("Please upload proof of permit/registration.");
    }
  };
}

function saveCompany(newCompany) {
  let companiesList = JSON.parse(localStorage.getItem("companiesList")) || [];
  if (companiesList.some(c => c.email === newCompany.email)) {
    alert("Email already registered.");
    return;
  }
  companiesList.push(newCompany);
  localStorage.setItem("companiesList", JSON.stringify(companiesList));
  alert("Registration successful! Please log in.");
  window.location.href = "login.html";
}

if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").onsubmit = function (e) {
    e.preventDefault();
    const userType = document.getElementById("loginType").value;
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem(userType === "student" ? "students" : "companiesList")) || [];
    let user = users.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("loggedInType", userType);
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      window.location.href = userType === "student" ? "dashboard.html" : "company-dashboard.html";
    } else {
      alert("Invalid login. Please check your credentials.");
    }
  };
}

if (document.getElementById("publicInternshipList")) {
  renderPublicInternships();
}

function renderPublicInternships() {
  const internships = JSON.parse(localStorage.getItem("internshipListings")) || [];
  const container = document.getElementById("publicInternshipList");
  if (internships.length === 0) {
    container.innerHTML = "<p>No internships available at the moment.</p>";
    return;
  }
  container.innerHTML = "";
  internships.forEach(listing => {
    const div = document.createElement("div");
    div.className = "listing-card";
    div.innerHTML = `
      <div class="listing-title">${listing.title}</div>
      <div class="listing-meta">${listing.company} &middot; ${listing.location}</div>
      <div>${listing.desc.substring(0, 110)}...</div>
      <div class="listing-meta">Requirements: ${listing.reqs}</div>
      <a class="cta-btn" href="internship.html?id=${listing.id}">View & Apply</a>
    `;
    container.appendChild(div);
  });
}

if (document.getElementById("internshipDetail")) {
  showInternshipDetail();
}

function showInternshipDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const internships = JSON.parse(localStorage.getItem("internshipListings")) || [];
  const companies = JSON.parse(localStorage.getItem("companiesList")) || [];
  const listing = internships.find(l => l.id === id);
  const company = companies.find(c => c.name === (listing ? listing.company : ""));
  const detail = document.getElementById("internshipDetail");
  const applySec = document.getElementById("applySection");

  if (!listing) {
    detail.innerHTML = "<p>Internship not found.</p>";
    return;
  }

  detail.innerHTML = `
    <div class="listing-card">
      <div class="listing-title">${listing.title}</div>
      <div class="listing-meta">${listing.company} &middot; ${listing.location}</div>
      <div style="margin-top:0.7em;">${listing.desc.replace(/\n/g, "<br>")}</div>
      <div class="listing-meta" style="margin-top:0.5em;">Requirements: ${listing.reqs}</div>
      <div class="listing-meta" style="margin-top:0.5em;">
        <b>Company Contact:</b> ${company ? (company.email || "N/A") : "N/A"}
      </div>
    </div>
  `;

  const loggedInType = localStorage.getItem("loggedInType");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  if (loggedInType === "student") {
    let applied = JSON.parse(localStorage.getItem("studentApplications")) || [];
    let already = applied.some(app => app.listingId === listing.id && app.studentEmail === loggedInUser.email);
    if (already) {
      applySec.innerHTML = `<p style="margin-top:1em;"><b>You have already submitted an attachment letter for this internship.</b></p>`;
      return;
    }
    let form = `
      <form id="applyForm" style="margin-top:1.5em;">
        <label>Upload your official school attachment letter (PDF/DOC):</label>
        <input type="file" id="attachmentLetter" accept=".pdf,.doc,.docx,image/*" required>
        <button type="submit" class="cta-btn">Submit Attachment Letter</button>
      </form>
    `;
    applySec.innerHTML = form;
    document.getElementById("applyForm").onsubmit = function(e) {
      e.preventDefault();
      let apps = JSON.parse(localStorage.getItem("studentApplications")) || [];
      let fileInput = document.getElementById("attachmentLetter");
      if (fileInput.files && fileInput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(evt) {
          let entry = {
            listingId: listing.id,
            studentEmail: loggedInUser.email,
            studentName: loggedInUser.name,
            date: new Date().toLocaleString(),
            attachment: evt.target.result,
            attachmentName: fileInput.files[0].name
          };
          apps.push(entry);
          localStorage.setItem("studentApplications", JSON.stringify(apps));
          alert("Attachment letter submitted!");
          location.reload();
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    };
  } else {
    applySec.innerHTML = `<p style="margin-top:1em;"><b>Login as a student to submit your attachment letter for this internship.</b></p>`;
  }
}

if (document.getElementById("internshipList")) {
  renderInternshipListings();
  renderStudentApplications();
}

function renderInternshipListings() {
  const internships = JSON.parse(localStorage.getItem("internshipListings")) || [];
  const applied = JSON.parse(localStorage.getItem("studentApplications")) || [];
  const student = JSON.parse(localStorage.getItem("loggedInUser")) || {};
  const internshipList = document.getElementById("internshipList");
  internshipList.innerHTML = internships.length === 0 ? "<p>No listings yet.</p>" : "";

  internships.forEach(listing => {
    const alreadyApplied = applied.some(app => app.listingId === listing.id && app.studentEmail === student.email);
    const div = document.createElement("div");
    div.className = "listing-card";
    div.innerHTML = `
      <div class="listing-title">${listing.title}</div>
      <div class="listing-meta">${listing.company} &middot; ${listing.location}</div>
      <div>${listing.desc.substring(0, 110)}...</div>
      <div class="listing-meta">Requirements: ${listing.reqs}</div>
      <a class="cta-btn" href="internship.html?id=${listing.id}">${alreadyApplied ? "Applied" : "View & Apply"}</a>
    `;
    internshipList.appendChild(div);
  });
}

function renderStudentApplications() {
  const internships = JSON.parse(localStorage.getItem("internshipListings")) || [];
  const applied = JSON.parse(localStorage.getItem("studentApplications")) || [];
  const student = JSON.parse(localStorage.getItem("loggedInUser")) || {};
  const applicationList = document.getElementById("applicationList");
  const myApps = applied.filter(app => app.studentEmail === student.email);
  applicationList.innerHTML = myApps.length === 0 ? "<p>No applications yet.</p>" : "";
  myApps.forEach(app => {
    const listing = internships.find(l => l.id === app.listingId);
    if (!listing) return;
    const div = document.createElement("div");
    div.className = "listing-card";
    div.innerHTML = `
      <div class="listing-title">${listing.title}</div>
      <div class="listing-meta">${listing.company} &middot; ${listing.location}</div>
      <div>Applied on: ${app.date}</div>
      <div>Attachment: <a href="${app.attachment}" target="_blank" download="${app.attachmentName}">${app.attachmentName}</a></div>
    `;
    applicationList.appendChild(div);
  });
}

if (document.getElementById("companyListingList")) {
  renderCompanyListings();
  renderReceivedApplications();
}

function showAddListingForm() {
  document.getElementById("addListingForm").style.display = "block";
}

if (document.getElementById("companyListingForm")) {
  document.getElementById("companyListingForm").onsubmit = function(e) {
    e.preventDefault();
    const company = JSON.parse(localStorage.getItem("loggedInUser"));
    let internships = JSON.parse(localStorage.getItem("internshipListings")) || [];
    const newListing = {
      id: "listing_" + Date.now(),
      company: company.name,
      title: document.getElementById("listingTitle").value,
      desc: document.getElementById("listingDesc").value,
      location: document.getElementById("listingLocation").value,
      reqs: document.getElementById("listingReqs").value
    };
    internships.push(newListing);
    localStorage.setItem("internshipListings", JSON.stringify(internships));
    alert("Listing added!");
    document.getElementById("companyListingForm").reset();
    document.getElementById("addListingForm").style.display = "none";
    renderCompanyListings();
    renderPublicInternships && renderPublicInternships();
  };
}

function renderCompanyListings() {
  const company = JSON.parse(localStorage.getItem("loggedInUser"));
  const internships = JSON.parse(localStorage.getItem("internshipListings")) || [];
  const list = document.getElementById("companyListingList");
  const myListings = internships.filter(l => l.company === company.name);
  list.innerHTML = myListings.length === 0 ? "<p>No listings yet.</p>" : "";
  myListings.forEach(listing => {
    const div = document.createElement("div");
    div.className = "listing-card";
    div.innerHTML = `
      <div class="listing-title">${listing.title}</div>
      <div class="listing-meta">${listing.location}</div>
      <div>${listing.desc}</div>
      <div class="listing-meta">Requirements: ${listing.reqs}</div>
    `;
    list.appendChild(div);
  });
}

function renderReceivedApplications() {
  const company = JSON.parse(localStorage.getItem("loggedInUser"));
  const internships = JSON.parse(localStorage.getItem("internshipListings")) || [];
  const apps = JSON.parse(localStorage.getItem("studentApplications")) || [];
  const myListings = internships.filter(l => l.company === company.name);
  const list = document.getElementById("receivedApplications");
  let out = "";
  myListings.forEach(listing => {
    const listingApps = apps.filter(app => app.listingId === listing.id);
    if (listingApps.length > 0) {
      out += `<div class="listing-card"><div class="listing-title">${listing.title}</div>`;
      listingApps.forEach(app => {
        out += `<div class="listing-meta">
        ${app.studentName} (${app.studentEmail})<br>
        Applied: ${app.date}<br>
        <a href="${app.attachment}" target="_blank" download="${app.attachmentName}">Download Attachment Letter</a>
        </div>`;
      });
      out += "</div>";
    }
  });
  list.innerHTML = out || "<p>No applications yet.</p>";
}