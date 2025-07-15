import { aptitudeData, codingData } from "./data.js";

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize navigation tabs
  setupNavigation();
  // Initialize aptitude sections
  initializeAptitudeSections();
  // Initialize coding section
  initializeCodingSection();
  // Load progress from localStorage
  loadProgress();
  // Calculate initial overall progress
  updateOverallProgress();
});

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

    const topicHeader = document.createElement("div");
    topicHeader.className = "topic-header";
    topicHeader.textContent = category;

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

    const topicHeader = document.createElement("div");
    topicHeader.className = "topic-header";
    topicHeader.textContent = topic;

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
  }
}

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
  // Calculate aptitude progress
  const aptitudeTopics = document.querySelectorAll("#aptitude .topic-item");
  const aptitudeDone = document.querySelectorAll(
    '#aptitude .done-btn[data-state="active"]'
  ).length;
  // Calculate coding progress
  const codingQuestions = document.querySelectorAll("#coding .question");
  const codingDone = document.querySelectorAll(
    '#coding .done-btn[data-state="active"]'
  ).length;
  const totalItems = aptitudeTopics.length + codingQuestions.length;
  const completedItems = aptitudeDone + codingDone;
  const percentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
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
  // Save aptitude progress
  document.querySelectorAll("#aptitude .topic-item").forEach((item) => {
    const category = item.querySelector(".done-btn").dataset.category;
    const topic = item.querySelector(".done-btn").dataset.topic;
    if (!progress.aptitude[category]) progress.aptitude[category] = {};
    progress.aptitude[category][topic] = {
      done: item.querySelector(".done-btn").dataset.state === "active",
      revise: item.querySelector(".revise-btn").dataset.state === "active",
    };
  });
  // Save coding progress
  document.querySelectorAll("#coding .question").forEach((question) => {
    const topic = question.querySelector(".done-btn").dataset.topic;
    const difficulty = question.querySelector(".done-btn").dataset.difficulty;
    const questionTitle = question.querySelector(".done-btn").dataset.question;
    if (!progress.coding[topic]) progress.coding[topic] = {};
    if (!progress.coding[topic][difficulty])
      progress.coding[topic][difficulty] = {};
    progress.coding[topic][difficulty][questionTitle] = {
      done: question.querySelector(".done-btn").dataset.state === "active",
      revise: question.querySelector(".revise-btn").dataset.state === "active",
    };
  });
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
}
