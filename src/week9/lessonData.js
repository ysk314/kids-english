import { resolveAppPath } from "../week5/utils.js";

const screenPath = (id) => resolveAppPath(`mockup/screens/week9/${id}.html`);

export const WORK_PHASES = {
  IDLE: 0,
  SUBJECT_SPINNING: 1,
  PREDICATE_SPINNING: 2,
  REVEALING: 3,
  REVEALED: 4
};

export const ROULETTE_INTERVAL_MS = 120;

export const SUBJECTS = [
  {
    key: "mutsumi-sensei",
    jp: "むつみ先生",
    en: "Mutsumi",
    img: "mockup/assets/week9/mutsumi-sensei.png"
  },
  {
    key: "bee",
    jp: "はち",
    en: "A bee",
    img: "mockup/assets/week9/bee.png"
  },
  {
    key: "bus",
    jp: "バス",
    en: "A bus",
    img: "mockup/assets/week9/bus.png"
  },
  {
    key: "apple",
    jp: "りんご",
    en: "An apple",
    img: "mockup/assets/week9/apple.png"
  },
  {
    key: "elephant",
    jp: "ぞう",
    en: "An elephant",
    img: "mockup/assets/week9/elephant.png"
  },
  {
    key: "rabbit",
    jp: "うさぎ",
    en: "A rabbit",
    img: "mockup/assets/week9/rabbit.png"
  },
  {
    key: "monster",
    jp: "モンスター",
    en: "A monster",
    img: "mockup/assets/week9/monster.png"
  }
];

export const PREDICATES = [
  {
    key: "english-teacher",
    jp: "えいごの せんせいです。",
    en: "an English teacher",
    enSentence: "is an English teacher."
  },
  {
    key: "insect",
    jp: "むしです。",
    en: "an insect",
    enSentence: "is an insect."
  },
  {
    key: "vehicle",
    jp: "のりものです。",
    en: "a vehicle",
    enSentence: "is a vehicle."
  },
  {
    key: "red",
    jp: "あかい。",
    en: "red",
    enSentence: "is red."
  },
  {
    key: "big",
    jp: "おおきい。",
    en: "big",
    enSentence: "is big."
  },
  {
    key: "cute",
    jp: "かわいい。",
    en: "cute",
    enSentence: "is cute."
  },
  {
    key: "scary",
    jp: "こわい。",
    en: "scary",
    enSentence: "is scary."
  }
];

const RHYTHM_SEQUENCE = [1, 2, 3, 4, 5, 6, 0];

export const FLOW_STEPS = [
  { id: "jp_rhythm", label: "1 にほんご リズム" },
  { id: "jp_work", label: "2 にほんご ルーレット" },
  { id: "en_rhythm", label: "3 英語リズム" },
  { id: "en_work", label: "4 英語ルーレット" }
];

export const LESSON_GOALS = [
  {
    id: "1",
    text: "主語と述語をつなげて、ふつうの文をリズムよく言う。"
  },
  {
    id: "2",
    text: "主語ルーレットと述語ルーレットで、新しい文を楽しく作る。"
  },
  {
    id: "3",
    text: "日本語の活動を、そのまま英語の SVC 文へつなげる。"
  }
];

function rhythmTitle(lang, index) {
  return lang === "jp" ? `にほんご リズム ${index + 1}/7` : `English Rhythm ${index + 1}/7`;
}

function rhythmAim(lang) {
  return lang === "jp"
    ? "1つの絵と1つの文を見て、声とテンポをそろえて繰り返す。"
    : "Repeat one picture and one SVC sentence in steady rhythm.";
}

function buildRhythmScript(index, lang) {
  const mappedIndex = RHYTHM_SEQUENCE[index] ?? index;
  const line = buildSentenceByIndex(mappedIndex, mappedIndex, lang);
  if (lang === "jp") {
    return `せんせい「${line}」`;
  }
  return `Teacher: "${line}"`;
}

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
    modeLabel: "テーマ",
    screenPath: screenPath("11_theme_title"),
    hint: {
      title: "だい9しゅう どんなだ？ なんだ？",
      aim: "主語をことばで説明する文へ、楽しく入る。",
      script: "せんせい「きょうは しゅごと じゅつごで ぶんを つくろう！」"
    }
  };
}

function createRhythmSlides(lang) {
  const isJp = lang === "jp";
  return RHYTHM_SEQUENCE.map((subjectIndex, index) => ({
    id: `${isJp ? "12_jp" : "16_en"}_rhythm_${index + 1}`,
    phase: lang,
    stepId: `${lang}_rhythm`,
    kind: "rhythm",
    bpm: isJp ? 90 : 95,
    modeLabel: isJp ? "にほんご リズム" : "英語リズム",
    screenPath: screenPath(`${isJp ? "12_jp" : "16_en"}_rhythm_${index + 1}`),
    hint: {
      title: rhythmTitle(lang, index),
      aim: rhythmAim(lang),
      script: buildRhythmScript(index, lang)
    }
  }));
}

function createWorkSlide(lang) {
  const isJp = lang === "jp";
  const id = isJp ? "13_jp_work_1" : "17_en_work_1";
  return {
    id,
    phase: lang,
    stepId: `${lang}_work`,
    kind: "work",
    bpm: null,
    modeLabel: isJp ? "にほんご ルーレット" : "英語ルーレット",
    screenPath: screenPath(id),
    hint: {
      title: isJp ? "ルーレットで ぶんを つくろう" : "Make a sentence with roulette",
      aim: isJp
        ? "主語ルーレットと述語ルーレットを止めて、新しい文を作る。"
        : "Stop the subject and predicate roulettes to create a new sentence.",
      script: isJp
        ? "せんせい「まず しゅご、つぎに じゅつご。でた ことばで ぶんを つくろう！」"
        : 'Teacher: "First subject, then predicate. Let us make a sentence!"'
    }
  };
}

function createEndSlide() {
  return {
    id: "20_end",
    phase: "end",
    stepId: "en_work",
    kind: "end",
    bpm: null,
    modeLabel: "終了",
    screenPath: screenPath("20_end"),
    hint: {
      title: "End",
      aim: "日英の文づくりを振り返って授業を締める。",
      script: 'Teacher: "Great job making sentences today!"'
    }
  };
}

export function buildSentence(subject, predicate, lang) {
  if (lang === "jp") {
    return `${subject.jp}は ${predicate.jp}`;
  }
  return `${subject.en} ${predicate.enSentence}`;
}

export function buildSentenceByIndex(subjectIndex, predicateIndex, lang) {
  return buildSentence(SUBJECTS[subjectIndex], PREDICATES[predicateIndex], lang);
}

export function getCanonicalPredicateIndex(subjectIndex) {
  return subjectIndex;
}

export function getPredicatePool(subjectIndex) {
  return PREDICATES.map((_, index) => index).filter((index) => index !== getCanonicalPredicateIndex(subjectIndex));
}

export function buildCombinationId(subjectIndex, predicateIndex) {
  return `${SUBJECTS[subjectIndex].key}__${PREDICATES[predicateIndex].key}`;
}

export function buildCombinationImagePath(subjectIndex, predicateIndex) {
  return `mockup/assets/week9/${SUBJECTS[subjectIndex].key}_is_${PREDICATES[predicateIndex].key}.png`;
}

export const WORK_COMBINATIONS = SUBJECTS.flatMap((subject, subjectIndex) =>
  getPredicatePool(subjectIndex).map((predicateIndex) => ({
    id: buildCombinationId(subjectIndex, predicateIndex),
    subjectIndex,
    predicateIndex,
    jpSentence: buildSentenceByIndex(subjectIndex, predicateIndex, "jp"),
    enSentence: buildSentenceByIndex(subjectIndex, predicateIndex, "en"),
    imagePath: buildCombinationImagePath(subjectIndex, predicateIndex)
  }))
);

export function randomRouletteSeed(max) {
  return Math.floor(Math.random() * max);
}

export function getRouletteIndex(count, startedAt, seed = 0, now = Date.now()) {
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }
  const safeSeed = Number.isFinite(seed) ? Math.floor(seed) : 0;
  if (!Number.isFinite(startedAt)) {
    return ((safeSeed % count) + count) % count;
  }
  const ticks = Math.max(0, Math.floor((now - startedAt) / ROULETTE_INTERVAL_MS));
  return ((safeSeed + ticks) % count + count) % count;
}

export function getWorkDisplayState(interaction = {}, lang = "jp", now = Date.now()) {
  const phase = Number.isFinite(interaction.subStep)
    ? Math.max(WORK_PHASES.IDLE, Math.min(WORK_PHASES.REVEALED, Number(interaction.subStep)))
    : WORK_PHASES.IDLE;

  let subjectIndex = Number.isFinite(interaction.subjectIndex) ? Number(interaction.subjectIndex) : null;
  if (phase === WORK_PHASES.SUBJECT_SPINNING) {
    subjectIndex = getRouletteIndex(SUBJECTS.length, interaction.subjectStartedAt, interaction.subjectSeed, now);
  }

  let predicatePool = [];
  if (subjectIndex !== null && subjectIndex >= 0 && subjectIndex < SUBJECTS.length) {
    predicatePool = getPredicatePool(subjectIndex);
  }

  let predicateIndex = Number.isFinite(interaction.predicateIndex) ? Number(interaction.predicateIndex) : null;
  if (phase === WORK_PHASES.PREDICATE_SPINNING && predicatePool.length > 0) {
    const poolIndex = getRouletteIndex(
      predicatePool.length,
      interaction.predicateStartedAt,
      interaction.predicateSeed,
      now
    );
    predicateIndex = predicatePool[poolIndex];
  }

  const subject = subjectIndex !== null ? SUBJECTS[subjectIndex] : null;
  const predicate = predicateIndex !== null ? PREDICATES[predicateIndex] : null;
  const sentence =
    phase === WORK_PHASES.REVEALED && subject && predicate
      ? buildSentence(subject, predicate, lang)
      : "";

  return {
    phase,
    subjectIndex,
    predicateIndex,
    subject,
    predicate,
    predicatePool,
    sentence,
    imagePath:
      phase === WORK_PHASES.REVEALED && subjectIndex !== null && predicateIndex !== null
        ? buildCombinationImagePath(subjectIndex, predicateIndex)
        : "",
    comboId:
      phase === WORK_PHASES.REVEALED && subjectIndex !== null && predicateIndex !== null
        ? buildCombinationId(subjectIndex, predicateIndex)
        : "",
    status:
      lang === "jp"
        ? phase === WORK_PHASES.IDLE && subject && !predicate
          ? "つぎは じゅつご ルーレット！"
          : phase === WORK_PHASES.IDLE
          ? "ボタンで ルーレット スタート"
          : phase === WORK_PHASES.SUBJECT_SPINNING
            ? "しゅご ルーレット まわってる！"
            : phase === WORK_PHASES.PREDICATE_SPINNING
              ? "じゅつご ルーレット まわってる！"
              : phase === WORK_PHASES.REVEALING
                ? "けっか はっぴょう！"
                : "できた！ ぶんを よんでみよう"
        : phase === WORK_PHASES.IDLE && subject && !predicate
          ? "Next, start the predicate roulette."
          : phase === WORK_PHASES.IDLE
          ? "Press to start the roulette"
          : phase === WORK_PHASES.SUBJECT_SPINNING
            ? "Subject roulette is spinning"
            : phase === WORK_PHASES.PREDICATE_SPINNING
              ? "Predicate roulette is spinning"
              : phase === WORK_PHASES.REVEALING
                ? "Result announcement!"
                : "Sentence ready. Read it out loud."
  };
}

export function buildWeek9Slides() {
  return [
    createThemeTitleSlide(),
    ...createRhythmSlides("jp"),
    createDividerSlide({
      id: "12_jp_rhythm_to_work",
      stepId: "jp_work",
      modeLabel: "にほんご ルーレット",
      title: "ルーレットで ぶんを つくろう",
      aim: "主語ルーレットと述語ルーレットへ切り替え、新しい文づくりを始める。",
      script: "せんせい「こんどは ルーレットで ぶんを つくろう！」"
    }),
    createWorkSlide("jp"),
    createDividerSlide({
      id: "15_jp_to_en_start",
      stepId: "en_rhythm",
      modeLabel: "英語リズム",
      title: "English Part Start!",
      aim: "日本語で作った文の型を、英語の SVC 文へ切り替える。",
      script: 'Teacher: "Japanese part is done. English part start!"'
    }),
    ...createRhythmSlides("en"),
    createDividerSlide({
      id: "16_en_rhythm_to_work",
      stepId: "en_work",
      modeLabel: "英語ルーレット",
      title: "Make a sentence with roulette",
      aim: "英語でも subject と predicate を止めて、文を完成させる。",
      script: 'Teacher: "Now make a sentence in English with the roulette."'
    }),
    createWorkSlide("en"),
    createEndSlide()
  ];
}

export const WEEK9_SLIDES = buildWeek9Slides();

export function findSlideIndexById(slideId) {
  return WEEK9_SLIDES.findIndex((slide) => slide.id === slideId);
}

export function stepIndexForSlide(slide) {
  return FLOW_STEPS.findIndex((step) => step.id === slide.stepId);
}
