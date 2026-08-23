(function () {
  const state = {
    lang: localStorage.getItem("portfolioLang") || "zh",
    filter: "featured",
    view: "index",
    activeProject: null,
    activeSlide: 0,
    touchStartX: 0
  };

  const getData = () => window.portfolioData[state.lang];

  function applyLanguage() {
    const data = getData();
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (data.ui[key]) node.textContent = data.ui[key];
    });

    document.querySelectorAll(".lang-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === state.lang);
    });

    renderFilters();
    renderExperience();
    renderProjects();
    renderPhotos();
    renderDownloads();
  }

  function renderFilters() {
    const container = document.getElementById("filter-bar");
    container.innerHTML = getData()
      .filters.map(
        (filter) => `
          <button type="button" class="filter-button ${state.filter === filter.id ? "is-active" : ""}" data-filter="${filter.id}">
            ${filter.label}
          </button>
        `
      )
      .join("");

    document.querySelectorAll(".view-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === state.view);
    });
  }

  function renderExperience() {
    const experience = getData().experience;

    document.getElementById("education-list").innerHTML = experience.education
      .map(
        (item) => `
          <article class="timeline-item">
            <span>${item.period}</span>
            <div>
              <h3>${item.title}</h3>
              <p class="item-meta">${item.meta}</p>
              <p>${item.text}</p>
            </div>
          </article>
        `
      )
      .join("");

    document.getElementById("work-list").innerHTML = experience.work
      .map(
        (item) => `
          <article class="work-item">
            <div class="work-period">${item.period}</div>
            <div>
              <h3>${item.company}</h3>
              <p class="work-role">${item.role}</p>
              <p>${item.text}</p>
              <div class="skill-tags compact-tags">
                ${item.tags.map((tag) => `<span>${tag}</span>`).join("")}
              </div>
            </div>
          </article>
        `
      )
      .join("");

    document.getElementById("skills-groups").innerHTML = experience.skills
      .map(
        (group) => `
          <article class="skill-group">
            <h4>${group.group}</h4>
            <p>${group.items.join(" / ")}</p>
          </article>
        `
      )
      .join("");

    document.getElementById("course-tags").innerHTML = experience.coursework
      .map((course) => `<span>${course}</span>`)
      .join("");
  }

  function getVisibleProjects() {
    return getData()
      .projects.map((project, index) => ({ ...project, index }))
      .filter((project) => state.filter === "all" || project.tags.includes(state.filter));
  }

  function renderProjects() {
    const data = getData();
    const projects = getVisibleProjects();
    const container = document.getElementById("project-grid");
    container.classList.toggle("index-view", state.view === "index");

    container.innerHTML = projects
      .map((project) => (state.view === "index" ? renderProjectIndex(project, data) : renderProjectCard(project, data)))
      .join("");
  }

  function renderProjectCard(project, data) {
    return `
      <article class="project-card ${project.tags.includes("featured") ? "featured" : ""}">
        <button type="button" class="project-cover" data-project="${project.index}" aria-label="${data.ui.viewCase}: ${project.title}">
          <img src="${project.cover}" alt="${project.title}" loading="lazy" />
          <span>${data.ui.viewCase}</span>
        </button>
        <div class="project-meta">
          <span>${project.year}</span>
          <span>${project.type}</span>
        </div>
        <h3>${project.title}</h3>
        <p class="project-statement">${project.statement}</p>
        <p>${project.summary}</p>
        <dl>
          <div>
            <dt>${data.ui.roleLabel}</dt>
            <dd>${project.role}</dd>
          </div>
          <div>
            <dt>${data.ui.typeLabel}</dt>
            <dd>${project.keywords.join(" / ")}</dd>
          </div>
        </dl>
        <button type="button" class="button secondary case-button" data-project="${project.index}">${data.ui.viewCase}</button>
      </article>
    `;
  }

  function renderProjectIndex(project, data) {
    return `
      <article class="project-index-row">
        <button type="button" class="index-thumb" data-project="${project.index}" aria-label="${data.ui.viewCase}: ${project.title}">
          <img src="${project.cover}" alt="${project.title}" loading="lazy" />
        </button>
        <span>${project.year}</span>
        <div>
          <h3>${project.title}</h3>
          <p>${project.statement}</p>
        </div>
        <span>${project.keywords.join(" / ")}</span>
        <button type="button" class="text-link case-button" data-project="${project.index}">${data.ui.viewCase}</button>
      </article>
    `;
  }

  function getSlides(project) {
    const slides = [];
    if (project.files && project.files.length) {
      project.files.forEach((file, index) => {
        slides.push({
          image: file.thumbnail || project.cover,
          label: file.label || `${index + 1}`,
          file: file.path
        });
      });
    }
    if (project.images && project.images.length) {
      project.images.forEach((image, index) => {
        slides.push({
          image,
          label: `${project.title} ${index + 1}`,
          file: null
        });
      });
    }
    if (!slides.length) slides.push({ image: project.cover, label: project.title, file: null });
    return slides;
  }

  function renderProjectModal(index, slideIndex = 0) {
    const data = getData();
    const project = data.projects[index];
    const slides = getSlides(project);
    const active = Math.max(0, Math.min(slideIndex, slides.length - 1));
    const slide = slides[active];
    state.activeProject = index;
    state.activeSlide = active;

    document.getElementById("modal-content").innerHTML = `
      <div class="case-viewer">
        <div class="case-media" id="case-media">
          <button type="button" class="slide-nav prev" data-slide-step="-1" aria-label="${data.ui.previousSlide}">‹</button>
          <img src="${slide.image}" alt="${slide.label}" />
          <button type="button" class="slide-nav next" data-slide-step="1" aria-label="${data.ui.nextSlide}">›</button>
        </div>
        <div class="case-info">
          <div class="project-meta">
            <span>${project.year}</span>
            <span>${active + 1} / ${slides.length}</span>
          </div>
          <h2 id="modal-title">${project.title}</h2>
          <p class="modal-lede">${project.statement}</p>
          <dl class="modal-dl">
            <div>
              <dt>${data.ui.roleLabel}</dt>
              <dd>${project.role}</dd>
            </div>
            <div>
              <dt>${data.ui.projectQuestion}</dt>
              <dd>${project.question}</dd>
            </div>
            <div>
              <dt>${data.ui.projectStrategy}</dt>
              <dd>${project.strategy}</dd>
            </div>
            <div>
              <dt>${data.ui.projectOutcome}</dt>
              <dd>${project.outcome}</dd>
            </div>
          </dl>
          ${slide.file ? `<a class="button primary" href="${slide.file}" target="_blank" rel="noreferrer">${data.ui.openPdf}</a>` : ""}
        </div>
      </div>
      <div class="slide-thumbs">
        ${slides
          .map(
            (item, itemIndex) => `
              <button type="button" class="slide-thumb ${itemIndex === active ? "is-active" : ""}" data-slide-index="${itemIndex}">
                <img src="${item.image}" alt="${item.label}" loading="lazy" />
                <span>${item.label}</span>
              </button>
            `
          )
          .join("")}
      </div>
    `;

    const modal = document.getElementById("project-modal");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.querySelector(".modal-close").focus();
  }

  function moveSlide(step) {
    if (state.activeProject === null) return;
    const slides = getSlides(getData().projects[state.activeProject]);
    const next = (state.activeSlide + step + slides.length) % slides.length;
    renderProjectModal(state.activeProject, next);
  }

  function closeProjectModal() {
    document.getElementById("project-modal").setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    state.activeProject = null;
    state.activeSlide = 0;
  }

  function renderPhotos() {
    const container = document.getElementById("photo-strip");
    if (!container) return;
    container.innerHTML = getData()
      .photos.map(
        (photo) => `
          <figure class="photo-tile">
            <img src="${photo.thumb}" alt="${photo.label}" />
            <figcaption>${photo.label}</figcaption>
          </figure>
        `
      )
      .join("");
  }

  function renderDownloads() {
    const data = getData();
    document.getElementById("download-grid").innerHTML = data.downloads
      .map(
        (file) => `
          <article class="download-card">
            <span>${file.type}</span>
            <h3>${file.title}</h3>
            <p>${file.text}</p>
            <div class="download-actions">
              <a href="${file.path}" target="_blank" rel="noreferrer">${data.ui.openFile}</a>
              <a href="${file.path}" download>${data.ui.downloadFile}</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  function setupNavHighlight() {
    const navLinks = [...document.querySelectorAll(".nav-links a")];
    const targets = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] }
    );

    targets.forEach((target) => observer.observe(target));
  }

  document.addEventListener("click", (event) => {
    const langButton = event.target.closest(".lang-button");
    if (langButton) {
      state.lang = langButton.dataset.lang;
      localStorage.setItem("portfolioLang", state.lang);
      applyLanguage();
      return;
    }

    const filterButton = event.target.closest(".filter-button");
    if (filterButton) {
      state.filter = filterButton.dataset.filter;
      renderFilters();
      renderProjects();
      return;
    }

    const viewButton = event.target.closest(".view-button");
    if (viewButton) {
      state.view = viewButton.dataset.view;
      renderFilters();
      renderProjects();
      return;
    }

    const slideButton = event.target.closest("[data-slide-step]");
    if (slideButton) {
      moveSlide(Number(slideButton.dataset.slideStep));
      return;
    }

    const thumbButton = event.target.closest("[data-slide-index]");
    if (thumbButton && state.activeProject !== null) {
      renderProjectModal(state.activeProject, Number(thumbButton.dataset.slideIndex));
      return;
    }

    const projectButton = event.target.closest("[data-project]");
    if (projectButton) {
      renderProjectModal(Number(projectButton.dataset.project));
      return;
    }

    if (event.target.closest("[data-close-modal]")) closeProjectModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProjectModal();
    if (event.key === "ArrowRight") moveSlide(1);
    if (event.key === "ArrowLeft") moveSlide(-1);
  });

  document.addEventListener("touchstart", (event) => {
    if (!event.target.closest("#case-media")) return;
    state.touchStartX = event.changedTouches[0].clientX;
  });

  document.addEventListener("touchend", (event) => {
    if (!event.target.closest("#case-media")) return;
    const delta = event.changedTouches[0].clientX - state.touchStartX;
    if (Math.abs(delta) > 44) moveSlide(delta < 0 ? 1 : -1);
  });

  applyLanguage();
  setupNavHighlight();
})();
