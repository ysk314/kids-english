import { resolveAppPath } from "./utils.js";

const screenPath = (id) => resolveAppPath(`mockup/screens/${id}.html`);

const RHYTHM_PAIRS_JP = [
  {
    left: "ながい",
    right: "みじかい",
    leftImg: "../assets/oppositions_cards/long_jp.png",
    rightImg: "../assets/oppositions_cards/short_jp.png"
  },
  {
    left: "きれい",
    right: "きたない",
    leftImg: "../assets/oppositions_cards/clean_jp.png",
    rightImg: "../assets/oppositions_cards/dirty_jp.png"
  },
  {
    left: "あかるい",
    right: "くらい",
    leftImg: "../assets/oppositions_cards/bright_jp.png",
    rightImg: "../assets/oppositions_cards/dark_jp.png"
  },
  {
    left: "たつ",
    right: "すわる",
    leftImg: "../assets/oppositions_cards/stand_up_jp.png",
    rightImg: "../assets/oppositions_cards/sit_down_jp.png"
  }
];

const RHYTHM_PAIRS_EN = [
  {
    left: "long",
    right: "short",
    leftImg: "../assets/oppositions_cards/long_en.png",
    rightImg: "../assets/oppositions_cards/short_en.png"
  },
  {
    left: "clean",
    right: "dirty",
    leftImg: "../assets/oppositions_cards/clean_en.png",
    rightImg: "../assets/oppositions_cards/dirty_en.png"
  },
  {
    left: "bright",
    right: "dark",
    leftImg: "../assets/oppositions_cards/bright_en.png",
    rightImg: "../assets/oppositions_cards/dark_en.png"
  },
  {
    left: "stand up",
    right: "sit down",
    leftImg: "../assets/oppositions_cards/stand_up_en.png",
    rightImg: "../assets/oppositions_cards/sit_down_en.png"
  }
];

const WORK_JP = [
  {
    target: "ながい",
    ask: "ながい の はんたいは どっち？",
    script: "せんせい「ながい の はんたいは どっち？」"
  },
  {
    target: "みじかい",
    ask: "みじかい の はんたいは どっち？",
    script: "せんせい「みじかい の はんたいは どっち？」"
  },
  {
    target: "きれい",
    ask: "きれい の はんたいは どっち？",
    script: "せんせい「きれい の はんたいは どっち？」"
  },
  {
    target: "きたない",
    ask: "きたない の はんたいは どっち？",
    script: "せんせい「きたない の はんたいは どっち？」"
  },
  {
    target: "あかるい",
    ask: "あかるい の はんたいは どっち？",
    script: "せんせい「あかるい の はんたいは どっち？」"
  },
  {
    target: "くらい",
    ask: "くらい の はんたいは どっち？",
    script: "せんせい「くらい の はんたいは どっち？」"
  },
  {
    target: "たつ",
    ask: "たつ の はんたいは どっち？",
    script: "せんせい「たつ の はんたいは どっち？」"
  },
  {
    target: "すわる",
    ask: "すわる の はんたいは どっち？",
    script: "せんせい「すわる の はんたいは どっち？」"
  }
];

const WORK_EN = [
  {
    target: "long",
    ask: "Which is opposite to long?",
    script: 'Teacher: "Which is opposite to long?"'
  },
  {
    target: "short",
    ask: "Which is opposite to short?",
    script: 'Teacher: "Which is opposite to short?"'
  },
  {
    target: "clean",
    ask: "Which is opposite to clean?",
    script: 'Teacher: "Which is opposite to clean?"'
  },
  {
    target: "dirty",
    ask: "Which is opposite to dirty?",
    script: 'Teacher: "Which is opposite to dirty?"'
  },
  {
    target: "bright",
    ask: "Which is opposite to bright?",
    script: 'Teacher: "Which is opposite to bright?"'
  },
  {
    target: "dark",
    ask: "Which is opposite to dark?",
    script: 'Teacher: "Which is opposite to dark?"'
  },
  {
    target: "stand up",
    ask: "Which is opposite to stand up?",
    script: 'Teacher: "Which is opposite to stand up?"'
  },
  {
    target: "sit down",
    ask: "Which is opposite to sit down?",
    script: 'Teacher: "Which is opposite to sit down?"'
  }
];

const DEEP_COMPARE_PAIRS_JP = [
  "みじかいえんぴつ / ながいえんぴつ",
  "ながいえんぴつ / へび",
  "へび / ぞうのはな",
  "みじかいえんぴつ / ぞうのはな"
];

const DEEP_COMPARE_PAIRS_EN = [
  "short pencil / long pencil",
  "long pencil / snake",
  "snake / elephant trunk",
  "short pencil / elephant trunk"
];

export const FLOW_STEPS = [
  { id: "jp_rhythm", label: "1 日本語導入" },
  { id: "jp_work", label: "2 日本語本題" },
  { id: "jp_deep", label: "3 日本語深掘り" },
  { id: "en_rhythm", label: "4 英語導入" },
  { id: "en_work", label: "5 英語本題" },
  { id: "en_deep", label: "6 英語深掘り" }
];

export const LESSON_GOALS = [
  {
    id: "1",
    text: "対義語の概念を楽しく学ぶ"
  },
  {
    id: "2",
    text: "長い・短いなど、対義語が相対概念であることに気づかせる。"
  },
  {
    id: "3",
    text: "英語も、意味と音を結びつける。"
  }
];

function createDividerSlide({ id, stepId, modeLabel, title, aim, script }) {
  return {
    id,
    phase: "divider",
    stepId,
    kind: "divider",
    bpm: null,
    modeLabel,
    screenPath: screenPath(id),
    hint: {
      title,
      aim,
      script
    }
  };
}

function createThemeTitleSlide() {
  return {
    id: "11_theme_title",
    phase: "title",
    stepId: "jp_rhythm",
    kind: "divider",
    bpm: null,
    modeLabel: "授業テーマ",
    screenPath: screenPath("11_theme_title"),
    hint: {
      title: "今日のテーマ",
      aim: "第5週の対義語テーマを先に提示し、集中の入口を作る。",
      script: "せんせい「きょうは はんたいことばで あそぼう！」"
    }
  };
}

function createEndSlide() {
  return {
    id: "20_end",
    phase: "end",
    stepId: "en_deep",
    kind: "end",
    bpm: null,
    modeLabel: "終了",
    screenPath: screenPath("20_end"),
    hint: {
      title: "End",
      aim: "今日の学びを締めて、次回への期待で終える。",
      script: 'Teacher: "Great job today! See you next time!"'
    }
  };
}

function createRhythmSummarySlide({ id, phase, stepId, modeLabel, bpm }) {
  return {
    id,
    phase,
    stepId,
    kind: "rhythm",
    bpm,
    modeLabel,
    screenPath: screenPath(id),
    hint: {
      title: `${modeLabel} まとめ 5/5`,
      aim: phase === "jp" ? "4セットを続けて発話し、リズムを固定する。" : "4セットを英語で通し、テンポを維持する。",
      script:
        phase === "jp"
          ? "せんせい「4せっと まとめて いってみよう」"
          : 'Teacher: "All four pairs. Keep the rhythm!"'
    }
  };
}

function createRhythmSlides({ startNumber, phase, stepId, modeLabel, bpm, pairs, scriptPrefix }) {
  return pairs.map((pair, index) => {
    const id = `${startNumber}_${phase}_rhythm_${index + 1}`;
    return {
      id,
      phase,
      stepId,
      kind: "rhythm",
      bpm,
      modeLabel,
      screenPath: screenPath(id),
      hint: {
        title: `${modeLabel} ${index + 1}/4`,
        aim: phase === "jp" ? "BPM90で1語1動作を揃える。" : "BPM95で同じ動きを英語発話に切り替える。",
        script:
          phase === "jp"
            ? `せんせい「${pair.left}、${pair.right}。まねして いってみよう」`
            : `${scriptPrefix} "${pair.left}, ${pair.right}. Copy and say."`
      }
    };
  });
}

function createWorkSlides({ startNumber, phase, stepId, modeLabel, list }) {
  return list.map((item, index) => {
    const id = `${startNumber}_${phase}_work_${index + 1}`;
    return {
      id,
      phase,
      stepId,
      kind: "work",
      bpm: null,
      modeLabel,
      screenPath: screenPath(id),
      hint: {
        title: `1問ずつ選ぶ ${index + 1}/8`,
        aim: "大カード1枚 + 候補2枚で、即時に答え合わせする。",
        script: item.script
      }
    };
  });
}

function createDeepStepSlides({ startNumber, phase, stepId, modeLabel }) {
  const jpScripts = [
    "せんせい「これは長い？」",
    "せんせい「こっちは長い？どちらが短い？」",
    "せんせい「へびは長い？何と比べた？」",
    "せんせい「ぞうのはなは長い？」"
  ];

  const enScripts = [
    'Teacher: "Is this long?"',
    'Teacher: "Which one is longer?"',
    'Teacher: "Is the snake long? Compared to what?"',
    'Teacher: "Is the elephant trunk long?"'
  ];

  return Array.from({ length: 4 }, (_, index) => {
    const id = `${startNumber}_${phase}_deep_step_${index + 1}`;
    return {
      id,
      phase,
      stepId,
      kind: "deep_step",
      bpm: null,
      modeLabel,
      screenPath: screenPath(id),
      hint: {
        title: `順番比較 ${index + 1}/4`,
        aim: "比較対象を増やして、相対概念の気づきを作る。",
        script: phase === "jp" ? jpScripts[index] : enScripts[index]
      }
    };
  });
}

function createDeepCompareSlides({ startNumber, phase, stepId, modeLabel, pairs, scriptPrefix }) {
  return pairs.map((pair, index) => {
    const id = `${startNumber}_${phase}_deep_compare_${index + 1}`;
    return {
      id,
      phase,
      stepId,
      kind: "deep_compare",
      bpm: null,
      modeLabel,
      screenPath: screenPath(id),
      hint: {
        title: `比較切替 ${index + 1}/4`,
        aim: "赤枠の2枚を毎回変え、長短の相対性を定着させる。",
        script:
          phase === "jp"
            ? `せんせい「こんどは ${pair} を くらべよう」`
            : `${scriptPrefix} "Compare ${pair}. Which is long, which is short?"`
      }
    };
  });
}

export function buildWeek5Slides() {
  return [
    createThemeTitleSlide(),
    ...createRhythmSlides({
      startNumber: 12,
      phase: "jp",
      stepId: "jp_rhythm",
      modeLabel: "日本語導入",
      bpm: 90,
      pairs: RHYTHM_PAIRS_JP,
      scriptPrefix: "Teacher"
    }),
    createRhythmSummarySlide({
      id: "12_jp_rhythm_summary",
      phase: "jp",
      stepId: "jp_rhythm",
      modeLabel: "日本語導入",
      bpm: 90
    }),
    createDividerSlide({
      id: "12_jp_break_work",
      stepId: "jp_work",
      modeLabel: "日本語本題",
      title: "日本語本題へ",
      aim: "導入から本題へ切り替え、選択課題に集中させる。",
      script: "せんせい「つぎは えらぶ もんだい！」"
    }),
    ...createWorkSlides({
      startNumber: 13,
      phase: "jp",
      stepId: "jp_work",
      modeLabel: "日本語本題",
      list: WORK_JP
    }),
    createDividerSlide({
      id: "13_jp_break_deep",
      stepId: "jp_deep",
      modeLabel: "日本語深掘り",
      title: "深く考えるへ",
      aim: "反対語の正誤から、比較の観点へ移行する。",
      script: "せんせい「ふかく かんがえよう！」"
    }),
    ...createDeepStepSlides({
      startNumber: 14,
      phase: "jp",
      stepId: "jp_deep",
      modeLabel: "日本語深掘り"
    }),
    ...createDeepCompareSlides({
      startNumber: 15,
      phase: "jp",
      stepId: "jp_deep",
      modeLabel: "日本語深掘り",
      pairs: DEEP_COMPARE_PAIRS_JP,
      scriptPrefix: "Teacher"
    }),
    createDividerSlide({
      id: "15_break_en_start",
      stepId: "en_rhythm",
      modeLabel: "英語導入",
      title: "English Part Start!",
      aim: "日本語で作った意味を、英語の音へ切り替える。",
      script: 'Teacher: "English Part Start! Same motions, English words."'
    }),
    ...createRhythmSlides({
      startNumber: 16,
      phase: "en",
      stepId: "en_rhythm",
      modeLabel: "英語導入",
      bpm: 95,
      pairs: RHYTHM_PAIRS_EN,
      scriptPrefix: "Teacher"
    }),
    createRhythmSummarySlide({
      id: "16_en_rhythm_summary",
      phase: "en",
      stepId: "en_rhythm",
      modeLabel: "英語導入",
      bpm: 95
    }),
    createDividerSlide({
      id: "16_en_break_work",
      stepId: "en_work",
      modeLabel: "英語本題",
      title: "Main Task Start!",
      aim: "英語での選択問題へ切り替える。",
      script: 'Teacher: "Main Task Start!"'
    }),
    ...createWorkSlides({
      startNumber: 17,
      phase: "en",
      stepId: "en_work",
      modeLabel: "英語本題",
      list: WORK_EN
    }),
    createDividerSlide({
      id: "17_en_break_deep",
      stepId: "en_deep",
      modeLabel: "英語深掘り",
      title: "Think Deeper!",
      aim: "英語のまま比較視点を切り替える。",
      script: 'Teacher: "Think Deeper!"'
    }),
    ...createDeepStepSlides({
      startNumber: 18,
      phase: "en",
      stepId: "en_deep",
      modeLabel: "英語深掘り"
    }),
    ...createDeepCompareSlides({
      startNumber: 19,
      phase: "en",
      stepId: "en_deep",
      modeLabel: "英語深掘り",
      pairs: DEEP_COMPARE_PAIRS_EN,
      scriptPrefix: "Teacher"
    }),
    createEndSlide()
  ];
}

export const WEEK5_SLIDES = buildWeek5Slides();

export function findSlideIndexById(slideId) {
  return WEEK5_SLIDES.findIndex((slide) => slide.id === slideId);
}

export function stepIndexForSlide(slide) {
  return FLOW_STEPS.findIndex((step) => step.id === slide.stepId);
}
