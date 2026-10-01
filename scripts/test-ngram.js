const { styles } = require("./vault-data.js");

function match(query) {
  let best = styles[0];
  let max = -1;
  styles.forEach(s => {
    let score = 0;
    const text = (s.name + " " + s.nameZh + " " + s.subtitle + " " + s.bestFor + " " + s.philosophy + " " + s.categoryZh).toLowerCase();
    
    // 1. 英文单词匹配
    const words = query.toLowerCase().split(/[^a-z0-9]+/);
    words.forEach(w => {
      if (w.length >= 3 && text.includes(w)) score += 10;
    });

    // 2. 中文 2-gram 窗口滑动匹配
    const cleanZh = query.replace(/[^\u4e00-\u9fa5]/g, "");
    for (let i = 0; i < cleanZh.length - 1; i++) {
      const gram = cleanZh.slice(i, i + 2);
      if (s.nameZh.includes(gram)) score += 20;
      else if (s.bestFor.includes(gram)) score += 10;
      else if (s.subtitle.includes(gram)) score += 6;
      else if (s.philosophy.includes(gram)) score += 3;
    }
    if (score > max) {
      max = score;
      best = s;
    }
  });
  return { num: best.num, nameZh: best.nameZh, name: best.name, score: max };
}

console.log("极简北欧风记账应用 ->", match("极简北欧风记账应用"));
console.log("极客高精暗黑AI运维终端 ->", match("极客高精暗黑AI运维终端"));
console.log("多巴胺糖果社交 ->", match("多巴胺糖果社交"));
console.log("赛博朋克霓虹游戏 ->", match("赛博朋克霓虹游戏"));
console.log("日式侘寂茶道 ->", match("日式侘寂茶道"));
console.log("彭博金融量化看板 ->", match("彭博金融量化看板"));
console.log("VisionOS空间计算流媒体 ->", match("VisionOS空间计算流媒体"));

