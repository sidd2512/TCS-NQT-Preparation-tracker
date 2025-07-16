import { aptitudeData, codingData, resourceLinks } from "./data.js";

// Initialize the app when DOM is loaded

document.addEventListener("DOMContentLoaded", function () {
  // Initialize navigation tabs
  setupNavigation();
  // Initialize aptitude sections
  initializeAptitudeSections();
  // Initialize coding section
  initializeCodingSection();
  // Render resources section
  renderResourcesSection();
  // Load progress from localStorage
  loadProgress();
  // Calculate initial overall progress
  updateOverallProgress();
});

function renderResourcesSection() {
  const resourcesSection = document.getElementById("resources");
  if (!resourcesSection) return;
  resourcesSection.innerHTML = `
    <h2 class="resources-title">Resources</h2>
    <div id="resource-cards"></div>
    <p class="resources-note">More resources will be added in the future.</p>
  `;
  const cardsContainer = resourcesSection.querySelector("#resource-cards");
  resourceLinks.forEach((resource) => {
    const card = document.createElement("div");
    card.className = "resource-card";
    card.innerHTML = `
      <span class="resource-card-title">${resource.title}</span>
      <a class="resource-card-link" href="${resource.link}" target="_blank" rel="noopener">${resource.label}</a>
    `;
    cardsContainer.appendChild(card);
  });
}

function setupNavigation() {
  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      navTabs.forEach((t) => t.classList.remove("active"));
      // Add active class to clicked tab
      this.classList.add("active");
      // Hide all sections
      document.querySelectorAll(".section").forEach((section) => {
        section.classList.remove("active");
      });
      // Show the selected section
      const sectionId = this.getAttribute("data-section");
      document.getElementById(sectionId).classList.add("active");
    });
  });
}

function initializeAptitudeSections() {
  const topicsContainer = document.getElementById("aptitude-topics-container");
  for (const [category, topics] of Object.entries(aptitudeData)) {
    const topicElement = document.createElement("div");
    topicElement.className = "topic";

    // Progress bar with background
    const topicProgressContainer = document.createElement("div");
    topicProgressContainer.className = "topic-progress-container";
    topicProgressContainer.style.display = "flex";
    topicProgressContainer.style.alignItems = "center";
    topicProgressContainer.style.margin = "8px 0 0 0";

    const topicProgressBarBg = document.createElement("div");
    topicProgressBarBg.className = "topic-progress-bar-bg";

    const topicProgressBar = document.createElement("div");
    topicProgressBar.className = "progress-bar topic-progress-bar";
    topicProgressBar.style.width = "0%";

    topicProgressBarBg.appendChild(topicProgressBar);

    const topicProgressText = document.createElement("span");
    topicProgressText.className = "topic-progress-text";
    topicProgressText.style.fontSize = "0.85rem";
    topicProgressText.style.marginLeft = "10px";
    topicProgressText.textContent = "0%";

    topicProgressContainer.appendChild(topicProgressBarBg);
    topicProgressContainer.appendChild(topicProgressText);

    // Count completed topics for this category
    let completedCount = 0;
    topics.forEach((topic) => {
      const progress = JSON.parse(
        localStorage.getItem("preparationDashboardProgress")
      );
      if (
        progress &&
        progress.aptitude &&
        progress.aptitude[category] &&
        progress.aptitude[category][topic] &&
        progress.aptitude[category][topic].done
      ) {
        completedCount++;
      }
    });

    const topicHeader = document.createElement("div");
    topicHeader.className = "topic-header";
    topicHeader.innerHTML = `<span class="topic-header-title">${category}</span><span class="topic-count">${completedCount}/${topics.length}</span>`;

    const subtopics = document.createElement("div");
    subtopics.className = "subtopics";

    // Create subtopic items
    topics.forEach((topic) => {
      const topicItem = document.createElement("div");
      topicItem.className = "topic-item";
      const statusIndicator = document.createElement("div");
      statusIndicator.className = "status-indicator status-pending";
      const topicName = document.createElement("span");
      topicName.className = "topic-name";
      topicName.textContent = topic;
      const topicActions = document.createElement("div");
      topicActions.className = "topic-actions";
      const doneBtn = document.createElement("button");
      doneBtn.className = "action-btn done-btn";
      doneBtn.innerHTML = "✓ Done";
      doneBtn.dataset.state = "inactive";
      doneBtn.dataset.category = category;
      doneBtn.dataset.topic = topic;
      const reviseBtn = document.createElement("button");
      reviseBtn.className = "action-btn revise-btn";
      reviseBtn.innerHTML = "↻ Revise";
      reviseBtn.dataset.state = "inactive";
      reviseBtn.dataset.category = category;
      reviseBtn.dataset.topic = topic;
      doneBtn.addEventListener("click", function () {
        this.dataset.state =
          this.dataset.state === "active" ? "inactive" : "active";
        this.classList.toggle("active");
        updateStatusIndicator(statusIndicator, topicItem);
        updateAptitudeProgress();
        updateOverallProgress();
        updateTopicProgressBar_Aptitude(
          category,
          topicProgressBar,
          topicProgressText
        );
        saveProgress();
        // Update the completed/total count in the topic header
        updateAptitudeTopicCount(category, topicHeader, topics);
      });
      reviseBtn.addEventListener("click", function () {
        this.dataset.state =
          this.dataset.state === "active" ? "inactive" : "active";
        this.classList.toggle("active");
        updateStatusIndicator(statusIndicator, topicItem);
        updateAptitudeProgress();
        updateOverallProgress();
        updateTopicProgressBar_Aptitude(
          category,
          topicProgressBar,
          topicProgressText
        );
        saveProgress();
        // Update the completed/total count in the topic header
        updateAptitudeTopicCount(category, topicHeader, topics);
      });
      topicActions.appendChild(doneBtn);
      topicActions.appendChild(reviseBtn);
      topicItem.appendChild(statusIndicator);
      topicItem.appendChild(topicName);
      topicItem.appendChild(topicActions);
      subtopics.appendChild(topicItem);
    });

    topicHeader.addEventListener("click", function () {
      this.classList.toggle("active");
      subtopics.classList.toggle("active");
    });

    topicElement.appendChild(topicHeader);
    topicElement.appendChild(topicProgressContainer);
    topicElement.appendChild(subtopics);
    topicsContainer.appendChild(topicElement);

    // Initial update for this topic's progress bar
    updateTopicProgressBar_Aptitude(
      category,
      topicProgressBar,
      topicProgressText
    );
    // Initial update for topic count
    updateAptitudeTopicCount(category, topicHeader, topics);
    // Update the completed/total count in the topic header for aptitude
    function updateAptitudeTopicCount(category, topicHeader, topics) {
      // Only count .done-btns within this topic section
      const topicDiv = topicHeader.closest(".topic");
      let completedCount = 0;
      let totalCount = 0;
      if (topicDiv) {
        const btns = topicDiv.querySelectorAll(".done-btn");
        totalCount = btns.length;
        btns.forEach((btn) => {
          if (btn.dataset.state === "active") completedCount++;
        });
      } else {
        totalCount = topics.length;
      }
      const countSpan = topicHeader.querySelector(".topic-count");
      if (countSpan) {
        countSpan.textContent = `${completedCount}/${totalCount}`;
      }
    }
  }
}

function updateTopicProgressBar_Aptitude(category, bar, text) {
  // Find all topic-items for this category
  const items = document.querySelectorAll(
    `.done-btn[data-category="${category}"]`
  );
  const total = items.length;
  let completed = 0;
  items.forEach((btn) => {
    if (btn.dataset.state === "active") completed++;
  });
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  bar.style.width = percent + "%";
  text.textContent = percent + "%";
}

function initializeCodingSection() {
  const topicsContainer = document.getElementById("coding-topics-container");
  for (const [topic, difficulties] of Object.entries(codingData)) {
    const topicElement = document.createElement("div");
    topicElement.className = "topic";

    // Progress bar with background
    const topicProgressContainer = document.createElement("div");
    topicProgressContainer.className = "topic-progress-container";
    topicProgressContainer.style.display = "flex";
    topicProgressContainer.style.alignItems = "center";
    topicProgressContainer.style.margin = "8px 0 0 0";

    const topicProgressBarBg = document.createElement("div");
    topicProgressBarBg.className = "topic-progress-bar-bg";

    const topicProgressBar = document.createElement("div");
    topicProgressBar.className = "progress-bar topic-progress-bar";
    topicProgressBar.style.width = "0%";

    topicProgressBarBg.appendChild(topicProgressBar);

    const topicProgressText = document.createElement("span");
    topicProgressText.className = "topic-progress-text";
    topicProgressText.style.fontSize = "0.85rem";
    topicProgressText.style.marginLeft = "10px";
    topicProgressText.textContent = "0%";

    topicProgressContainer.appendChild(topicProgressBarBg);
    topicProgressContainer.appendChild(topicProgressText);

    // Count completed questions for this topic
    let completedCount = 0;
    let totalCount = 0;
    for (const [difficulty, questions] of Object.entries(difficulties)) {
      totalCount += questions.length;
      const progress = JSON.parse(
        localStorage.getItem("preparationDashboardProgress")
      );
      questions.forEach((question) => {
        if (
          progress &&
          progress.coding &&
          progress.coding[topic] &&
          progress.coding[topic][difficulty] &&
          progress.coding[topic][difficulty][question.title] &&
          progress.coding[topic][difficulty][question.title].done
        ) {
          completedCount++;
        }
      });
    }

    const topicHeader = document.createElement("div");
    topicHeader.className = "topic-header";
    topicHeader.innerHTML = `<span class="topic-header-title">${topic}</span><span class="topic-count">${completedCount}/${totalCount}</span>`;

    const difficultyLevels = document.createElement("div");
    difficultyLevels.className = "difficulty-levels";

    for (const [difficulty, questions] of Object.entries(difficulties)) {
      const difficultyElement = document.createElement("div");
      difficultyElement.className = `difficulty ${difficulty.toLowerCase()}`;
      const difficultyHeader = document.createElement("div");
      difficultyHeader.className = "difficulty-header";
      difficultyHeader.textContent = `${difficulty} (${questions.length})`;
      const questionsList = document.createElement("div");
      questionsList.className = "questions-list";
      questions.forEach((question) => {
        const questionElement = document.createElement("div");
        questionElement.className = "question";
        const statusIndicator = document.createElement("div");
        statusIndicator.className = "status-indicator status-pending";
        const questionTitle = document.createElement("a");
        questionTitle.className = "question-title";
        questionTitle.textContent = question.title;
        questionTitle.href = question.link;
        questionTitle.target = "_blank";
        const linkContainer = document.createElement("div");
        linkContainer.className = "question-link-container";
        const leetcodeLogo = document.createElement("div");
        leetcodeLogo.className = "leetcode-logo";
        leetcodeLogo.textContent = "L";
        const questionLink = document.createElement("a");
        questionLink.className = "question-link";
        questionLink.href = question.link;
        questionLink.textContent = "Visit";
        questionLink.target = "_blank";
        linkContainer.appendChild(leetcodeLogo);
        linkContainer.appendChild(questionLink);
        const questionActions = document.createElement("div");
        questionActions.className = "question-actions";
        const doneBtn = document.createElement("button");
        doneBtn.className = "action-btn done-btn";
        doneBtn.innerHTML = "✓ Done";
        doneBtn.dataset.state = "inactive";
        doneBtn.dataset.topic = topic;
        doneBtn.dataset.difficulty = difficulty;
        doneBtn.dataset.question = question.title;
        const reviseBtn = document.createElement("button");
        reviseBtn.className = "action-btn revise-btn";
        reviseBtn.innerHTML = "↻ Revise";
        reviseBtn.dataset.state = "inactive";
        reviseBtn.dataset.topic = topic;
        reviseBtn.dataset.difficulty = difficulty;
        reviseBtn.dataset.question = question.title;
        doneBtn.addEventListener("click", function () {
          this.dataset.state =
            this.dataset.state === "active" ? "inactive" : "active";
          this.classList.toggle("active");
          updateStatusIndicator(statusIndicator, questionElement);
          updateCodingProgress();
          updateOverallProgress();
          updateTopicProgressBar_Coding(
            topic,
            topicProgressBar,
            topicProgressText
          );
          saveProgress();
          // Update the completed/total count in the topic header
          updateCodingTopicCount(topic, topicHeader, totalCount);
        });
        reviseBtn.addEventListener("click", function () {
          this.dataset.state =
            this.dataset.state === "active" ? "inactive" : "active";
          this.classList.toggle("active");
          updateStatusIndicator(statusIndicator, questionElement);
          updateCodingProgress();
          updateOverallProgress();
          updateTopicProgressBar_Coding(
            topic,
            topicProgressBar,
            topicProgressText
          );
          saveProgress();
          // Update the completed/total count in the topic header
          updateCodingTopicCount(topic, topicHeader, totalCount);
        });
        questionActions.appendChild(doneBtn);
        questionActions.appendChild(reviseBtn);
        questionElement.appendChild(statusIndicator);
        questionElement.appendChild(questionTitle);
        questionElement.appendChild(linkContainer);
        questionElement.appendChild(questionActions);
        questionsList.appendChild(questionElement);
      });
      difficultyHeader.addEventListener("click", function () {
        this.classList.toggle("active");
        questionsList.classList.toggle("active");
      });
      difficultyElement.appendChild(difficultyHeader);
      difficultyElement.appendChild(questionsList);
      difficultyLevels.appendChild(difficultyElement);
    }
    topicHeader.addEventListener("click", function () {
      this.classList.toggle("active");
      difficultyLevels.classList.toggle("active");
    });
    topicElement.appendChild(topicHeader);
    topicElement.appendChild(topicProgressContainer);
    topicElement.appendChild(difficultyLevels);
    topicsContainer.appendChild(topicElement);

    // Initial update for this topic's progress bar
    updateTopicProgressBar_Coding(topic, topicProgressBar, topicProgressText);
    // Initial update for topic count
    updateCodingTopicCount(topic, topicHeader, totalCount);
    // Update the completed/total count in the topic header for coding
    function updateCodingTopicCount(topic, topicHeader, totalCount) {
      // Only count .done-btns within this topic section
      const topicDiv = topicHeader.closest(".topic");
      let completedCount = 0;
      if (topicDiv) {
        const btns = topicDiv.querySelectorAll(".done-btn");
        btns.forEach((btn) => {
          if (btn.dataset.state === "active") completedCount++;
        });
      }
      const countSpan = topicHeader.querySelector(".topic-count");
      if (countSpan) {
        countSpan.textContent = `${completedCount}/${totalCount}`;
      }
    }
  }
}
// Enhanced navbar logic for section switching and resources scroll
document.addEventListener("DOMContentLoaded", function () {
  const navTabs = document.querySelectorAll(".nav-tab");
  const sections = {
    aptitude: document.getElementById("aptitude"),
    coding: document.getElementById("coding"),
    resources: document.getElementById("resources"),
  };
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      navTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      // Hide all sections
      Object.values(sections).forEach((sec) => (sec.style.display = "none"));
      // Show the selected section
      const section = sections[this.dataset.section];
      if (section) {
        section.style.display = "";
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
  // Show only aptitude section by default
  sections.aptitude.style.display = "";
  sections.coding.style.display = "none";
  sections.resources.style.display = "none";
});
function updateTopicProgressBar_Coding(topic, bar, text) {
  // Find all done-btns for this topic
  const items = document.querySelectorAll(`.done-btn[data-topic="${topic}"]`);
  const total = items.length;
  let completed = 0;
  items.forEach((btn) => {
    if (btn.dataset.state === "active") completed++;
  });
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  bar.style.width = percent + "%";
  text.textContent = percent + "%";
}

function updateStatusIndicator(indicator, parentElement) {
  const doneBtn = parentElement.querySelector(".done-btn");
  const reviseBtn = parentElement.querySelector(".revise-btn");
  indicator.classList.remove("status-done", "status-revise", "status-pending");
  if (doneBtn && doneBtn.dataset.state === "active") {
    indicator.classList.add("status-done");
  } else if (reviseBtn && reviseBtn.dataset.state === "active") {
    indicator.classList.add("status-revise");
  } else {
    indicator.classList.add("status-pending");
  }
}

function updateAptitudeProgress() {
  const allTopics = document.querySelectorAll("#aptitude .topic-item");
  const doneTopics = document.querySelectorAll(
    '#aptitude .done-btn[data-state="active"]'
  );
  const total = allTopics.length;
  const completed = doneTopics.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  // Update aptitude progress bar
  document.getElementById(
    "aptitude-progress-fill"
  ).style.width = `${percentage}%`;
  document.getElementById(
    "aptitude-progress-percentage"
  ).textContent = `${percentage}%`;
  // Removed updating aptitude-count
}

function updateCodingProgress() {
  const allQuestions = document.querySelectorAll("#coding .question");
  const doneQuestions = document.querySelectorAll(
    '#coding .done-btn[data-state="active"]'
  );
  const total = allQuestions.length;
  const completed = doneQuestions.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  // Update coding progress bar
  document.getElementById(
    "coding-progress-fill"
  ).style.width = `${percentage}%`;
  document.getElementById(
    "coding-progress-percentage"
  ).textContent = `${percentage}%`;
  // Removed updating coding-count
}

function updateOverallProgress() {
  // Calculate aptitude progress (as percent)
  const aptitudeTopics = document.querySelectorAll("#aptitude .topic-item");
  const aptitudeDone = document.querySelectorAll(
    '#aptitude .done-btn[data-state="active"]'
  ).length;
  const aptitudeTotal = aptitudeTopics.length;
  const aptitudePercent =
    aptitudeTotal > 0 ? (aptitudeDone / aptitudeTotal) * 100 : 0;

  // Calculate coding progress (as percent)
  const codingQuestions = document.querySelectorAll("#coding .question");
  const codingDone = document.querySelectorAll(
    '#coding .done-btn[data-state="active"]'
  ).length;
  const codingTotal = codingQuestions.length;
  const codingPercent = codingTotal > 0 ? (codingDone / codingTotal) * 100 : 0;

  // Weighted overall: 60% aptitude, 40% coding
  const percentage = Math.round(aptitudePercent * 0.6 + codingPercent * 0.4);

  // Update overall progress
  document.getElementById(
    "overall-progress-fill"
  ).style.width = `${percentage}%`;
  document.getElementById(
    "overall-progress-percentage"
  ).textContent = `${percentage}%`;
  // Removed updating overall-count
}

function saveProgress() {
  const progress = {
    aptitude: {},
    coding: {},
  };
  // Save aptitude progress and completed count per category
  const aptitudeCompletedCounts = {};
  document
    .querySelectorAll("#aptitude-topics-container .topic")
    .forEach((topicDiv) => {
      const header = topicDiv.querySelector(".topic-header");
      const category = header
        ?.querySelector(".topic-header-title")
        ?.textContent?.trim();
      if (!category) return;
      const btns = topicDiv.querySelectorAll(".done-btn");
      let completed = 0;
      btns.forEach((btn) => {
        const topic = btn.dataset.topic;
        if (!progress.aptitude[category]) progress.aptitude[category] = {};
        if (!progress.aptitude[category][topic])
          progress.aptitude[category][topic] = {};
        progress.aptitude[category][topic].done =
          btn.dataset.state === "active";
        progress.aptitude[category][topic].revise =
          topicDiv.querySelector('.revise-btn[data-topic="' + topic + '"]')
            ?.dataset.state === "active";
        if (btn.dataset.state === "active") completed++;
      });
      aptitudeCompletedCounts[category] = completed;
    });
  progress.aptitudeCompletedCounts = aptitudeCompletedCounts;

  // Save coding progress and completed count per topic
  const codingCompletedCounts = {};
  document
    .querySelectorAll("#coding-topics-container .topic")
    .forEach((topicDiv) => {
      const header = topicDiv.querySelector(".topic-header");
      const topic = header
        ?.querySelector(".topic-header-title")
        ?.textContent?.trim();
      if (!topic) return;
      const btns = topicDiv.querySelectorAll(".done-btn");
      let completed = 0;
      btns.forEach((btn) => {
        const difficulty = btn.dataset.difficulty;
        const questionTitle = btn.dataset.question;
        if (!progress.coding[topic]) progress.coding[topic] = {};
        if (!progress.coding[topic][difficulty])
          progress.coding[topic][difficulty] = {};
        progress.coding[topic][difficulty][questionTitle] = {
          done: btn.dataset.state === "active",
          revise:
            topicDiv.querySelector(
              '.revise-btn[data-question="' + questionTitle + '"]'
            )?.dataset.state === "active",
        };
        if (btn.dataset.state === "active") completed++;
      });
      codingCompletedCounts[topic] = completed;
    });
  progress.codingCompletedCounts = codingCompletedCounts;
  // Removed localStorage values for overall-count, aptitude-count, coding-count
  localStorage.setItem(
    "preparationDashboardProgress",
    JSON.stringify(progress)
  );
}

function loadProgress() {
  const savedProgress = localStorage.getItem("preparationDashboardProgress");
  if (!savedProgress) return;
  const progress = JSON.parse(savedProgress);
  // Load aptitude progress
  if (progress.aptitude) {
    for (const category in progress.aptitude) {
      for (const topic in progress.aptitude[category]) {
        const { done, revise } = progress.aptitude[category][topic];
        const topicItem = document
          .querySelector(
            `.done-btn[data-category="${category}"][data-topic="${topic}"]`
          )
          ?.closest(".topic-item");
        if (topicItem) {
          const doneBtn = topicItem.querySelector(".done-btn");
          const reviseBtn = topicItem.querySelector(".revise-btn");
          const statusIndicator = topicItem.querySelector(".status-indicator");
          if (done) {
            doneBtn.dataset.state = "active";
            doneBtn.classList.add("active");
          }
          if (revise) {
            reviseBtn.dataset.state = "active";
            reviseBtn.classList.add("active");
          }
          updateStatusIndicator(statusIndicator, topicItem);
        }
      }
    }
  }
  // Load coding progress
  if (progress.coding) {
    for (const topic in progress.coding) {
      for (const difficulty in progress.coding[topic]) {
        for (const questionTitle in progress.coding[topic][difficulty]) {
          const { done, revise } =
            progress.coding[topic][difficulty][questionTitle];
          const questionElement = document
            .querySelector(
              `.done-btn[data-topic="${topic}"][data-difficulty="${difficulty}"][data-question="${questionTitle}"]`
            )
            ?.closest(".question");
          if (questionElement) {
            const doneBtn = questionElement.querySelector(".done-btn");
            const reviseBtn = questionElement.querySelector(".revise-btn");
            const statusIndicator =
              questionElement.querySelector(".status-indicator");
            if (done) {
              doneBtn.dataset.state = "active";
              doneBtn.classList.add("active");
            }
            if (revise) {
              reviseBtn.dataset.state = "active";
              reviseBtn.classList.add("active");
            }
            updateStatusIndicator(statusIndicator, questionElement);
          }
        }
      }
    }
  }
  // Update all progress bars
  updateAptitudeProgress();
  updateCodingProgress();
  updateOverallProgress();

  // Use saved completed counts for each topic to update the UI
  setTimeout(() => {
    // Aptitude
    const aptitudeCompletedCounts = progress.aptitudeCompletedCounts || {};
    document
      .querySelectorAll("#aptitude-topics-container .topic")
      .forEach((topicDiv) => {
        const header = topicDiv.querySelector(".topic-header");
        const bar = topicDiv.querySelector(".topic-progress-bar");
        const text = topicDiv.querySelector(".topic-progress-text");
        const category = header
          ?.querySelector(".topic-header-title")
          ?.textContent?.trim();
        const btns = topicDiv.querySelectorAll(".done-btn");
        const totalCount = btns.length;
        const completed = aptitudeCompletedCounts[category] || 0;
        if (header && bar && text) {
          // Set progress bar and count
          const percent =
            totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0;
          bar.style.width = percent + "%";
          text.textContent = percent + "%";
          const countSpan = header.querySelector(".topic-count");
          if (countSpan) countSpan.textContent = `${completed}/${totalCount}`;
        }
      });
    // Coding
    const codingCompletedCounts = progress.codingCompletedCounts || {};
    document
      .querySelectorAll("#coding-topics-container .topic")
      .forEach((topicDiv) => {
        const header = topicDiv.querySelector(".topic-header");
        const bar = topicDiv.querySelector(".topic-progress-bar");
        const text = topicDiv.querySelector(".topic-progress-text");
        const topic = header
          ?.querySelector(".topic-header-title")
          ?.textContent?.trim();
        const btns = topicDiv.querySelectorAll(".done-btn");
        const totalCount = btns.length;
        const completed = codingCompletedCounts[topic] || 0;
        if (header && bar && text) {
          const percent =
            totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0;
          bar.style.width = percent + "%";
          text.textContent = percent + "%";
          const countSpan = header.querySelector(".topic-count");
          if (countSpan) countSpan.textContent = `${completed}/${totalCount}`;
        }
      });
  }, 0);
}
