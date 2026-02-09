(function () {
  const hints = [];

  const rhythmPairs = [
    "ながい / みじかい",
    "きれい / よごれ",
    "あかるい / くらい",
    "たつ / すわる"
  ];

  rhythmPairs.forEach((pair, i) => {
    hints.push({
      id: `12_jp_rhythm_${i + 1}`,
      phase: "にほんごどうにゅう",
      title: `どうにゅうりずむ ${i + 1}`,
      aim: `4せっとこてい。${pair} を からだで たいけんする。`,
      script: `せんせい「${pair}。まねして いってみよう」`
    });
  });

  const jpWorkTargets = [
    "ながい",
    "みじかい",
    "きれい",
    "よごれ",
    "あかるい",
    "くらい",
    "たつ",
    "すわる"
  ];

  jpWorkTargets.forEach((target, i) => {
    hints.push({
      id: `13_jp_work_${i + 1}`,
      phase: "にほんごほんだい",
      title: `1もんずつえらぶ ${i + 1}/8`,
      aim: "おおきい1まい + こうほ2まい で すぐ こたえあわせする。",
      script: `せんせい「${target} の はんたいは どっち？」`
    });
  });

  hints.push({
    id: "14_jp_deep_step_1",
    phase: "ふかくかんがえる",
    title: "4このものをじゅんばんにだす 1",
    aim: "みじかいえんぴつ を だして はんだんのきじゅんをだす。",
    script: "せんせい「これは ながい？」"
  });
  hints.push({
    id: "14_jp_deep_step_2",
    phase: "ふかくかんがえる",
    title: "4このものをじゅんばんにだす 2",
    aim: "しんぴんえんぴつ を ならべて ひかくさせる。",
    script: "せんせい「こっちは ながい？ どっちが みじかい？」"
  });
  hints.push({
    id: "14_jp_deep_step_3",
    phase: "ふかくかんがえる",
    title: "4このものをじゅんばんにだす 3",
    aim: "へび を くわえて ひかくたいしょうをひろげる。",
    script: "せんせい「へびは ながい？ だれと くらべた？」"
  });
  hints.push({
    id: "14_jp_deep_step_4",
    phase: "ふかくかんがえる",
    title: "4このものをじゅんばんにだす 4",
    aim: "ぞうのはな を くわえて そうたいてきなみかたへつなぐ。",
    script: "せんせい「ぞうのはなは ながい？」"
  });

  const jpCompare = [
    "みじかいえんぴつ / ながいえんぴつ",
    "ながいえんぴつ / へび",
    "へび / ぞうのはな",
    "みじかいえんぴつ / ぞうのはな"
  ];

  jpCompare.forEach((pair, i) => {
    hints.push({
      id: `15_jp_deep_compare_${i + 1}`,
      phase: "ふかくかんがえる",
      title: `あかわくひかく ${i + 1}`,
      aim: "あかわくぺあをかえて、ながい/みじかいはそうたいだときづかせる。",
      script: `せんせい「こんどは ${pair} を くらべよう」`
    });
  });

  rhythmPairs.forEach((pair, i) => {
    hints.push({
      id: `16_en_rhythm_${i + 1}`,
      phase: "えいごどうにゅう",
      title: `えいごりずむ ${i + 1}`,
      aim: `どうさはおなじ。BPM95で えいごはつわへきりかえる。`,
      script: `Teacher: "Say in English. ${pair}."`
    });
  });

  const enWorkTargets = [
    "long",
    "short",
    "clean",
    "dirty",
    "bright",
    "dark",
    "stand up",
    "sit down"
  ];

  enWorkTargets.forEach((target, i) => {
    hints.push({
      id: `17_en_work_${i + 1}`,
      phase: "えいごほんだい",
      title: `english choose ${i + 1}/8`,
      aim: "おなじがめんで、えいごでこたえる。",
      script: `Teacher: "Which is opposite to ${target}?"`
    });
  });

  hints.push({
    id: "18_en_deep_step_1",
    phase: "えいごふかくかんがえる",
    title: "think deeper step 1",
    aim: "short pencil から relative comparison を始める。",
    script: "Teacher: \"Is this long?\""
  });
  hints.push({
    id: "18_en_deep_step_2",
    phase: "えいごふかくかんがえる",
    title: "think deeper step 2",
    aim: "long pencil を追加し compare の軸を作る。",
    script: "Teacher: \"Which one is longer?\""
  });
  hints.push({
    id: "18_en_deep_step_3",
    phase: "えいごふかくかんがえる",
    title: "think deeper step 3",
    aim: "snake を追加して比較相手を変える。",
    script: "Teacher: \"Is the snake long? Compared to what?\""
  });
  hints.push({
    id: "18_en_deep_step_4",
    phase: "えいごふかくかんがえる",
    title: "think deeper step 4",
    aim: "elephant trunk を追加して相対概念を定着させる。",
    script: "Teacher: \"Is the elephant trunk long?\""
  });

  const enCompare = [
    "short pencil / long pencil",
    "long pencil / snake",
    "snake / elephant trunk",
    "short pencil / elephant trunk"
  ];

  enCompare.forEach((pair, i) => {
    hints.push({
      id: `19_en_deep_compare_${i + 1}`,
      phase: "えいごふかくかんがえる",
      title: `compare switch ${i + 1}`,
      aim: "red frame を切り替えて relative opposite を確認する。",
      script: `Teacher: "Compare ${pair}. Which is long/short now?"`
    });
  });

  window.week5Hints = hints;
})();
