(function () {
  function qs(selector) {
    return document.querySelector(selector);
  }

  function renderWeekChips(containerSelector, options) {
    var container = qs(containerSelector);
    if (!container || !window.curriculumData) {
      return;
    }

    var doneUntil = (options && options.doneUntil) || 0;
    var focused = new Set((options && options.focusedWeeks) || []);

    container.innerHTML = "";
    window.curriculumData.forEach(function (row) {
      var chip = document.createElement("div");
      chip.className = "week-chip";

      if (row.week <= doneUntil) {
        chip.classList.add("done");
      }

      if (focused.has(row.week)) {
        chip.classList.add("focus");
      }

      chip.textContent = "W" + row.week;
      chip.title = row.major + " / " + row.minor;
      container.appendChild(chip);
    });
  }

  function renderTimeline(containerSelector, startWeek, endWeek) {
    var container = qs(containerSelector);
    if (!container || !window.curriculumData) {
      return;
    }

    var rows = window.curriculumData.filter(function (row) {
      return row.week >= startWeek && row.week <= endWeek;
    });

    container.innerHTML = "";

    rows.forEach(function (row) {
      var rowEl = document.createElement("div");
      rowEl.className = "timeline-row";

      rowEl.innerHTML =
        '<div class="timeline-cell"><strong>第' +
        row.week +
        '週</strong></div>' +
        '<div class="timeline-cell"><strong>' +
        row.major +
        '</strong></div>' +
        '<div class="timeline-cell">' +
        row.minor +
        '<br><span style="color:#5a5a68">' +
        row.activity +
        '</span></div>' +
        '<div class="timeline-cell"><span class="badge gray">' +
        row.template +
        "</span></div>";

      container.appendChild(rowEl);
    });
  }

  function getWeek(weekNo) {
    if (!window.curriculumData) {
      return null;
    }

    return window.curriculumData.find(function (row) {
      return row.week === weekNo;
    });
  }

  function setText(selector, text) {
    var node = qs(selector);
    if (node) {
      node.textContent = text;
    }
  }

  window.MockupUI = {
    renderWeekChips: renderWeekChips,
    renderTimeline: renderTimeline,
    getWeek: getWeek,
    setText: setText
  };
})();
