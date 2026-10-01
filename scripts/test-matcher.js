const { styles } = require('./vault-data.js');

function matchQuery(queryStr) {
  const query = queryStr.toLowerCase();
  let best = styles[0];
  let maxScore = -1;

  for (const s of styles) {
    let score = 0;
    // 1. 中英文名匹配
    if (query.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(query)) score += 10;
    if (query.includes(s.nameZh) || s.nameZh.includes(query)) score += 10;

    // 2. 关键词与标签双向比对
    if (Array.isArray(s.keywords)) {
      for (const kw of s.keywords) {
        if (query.includes(kw.toLowerCase())) score += 6;
      }
    }

    // 3. 适用场景分词命中
    if (s.bestFor) {
      const tokens = s.bestFor.split(/[、,，。\s/]+/);
      for (const t of tokens) {
        if (t.length >= 2 && (query.includes(t) || t.includes(query))) {
          score += 5;
        }
      }
    }

    // 4. 副标题与哲学理念关键词
    if (s.subtitle && query.split('').some((_, i, arr) => i < arr.length - 1 && s.subtitle.includes(arr[i] + arr[i+1]))) {
      // 简单二元字匹配
    }

    if (score > maxScore) {
      maxScore = score;
      best = s;
    }
  }
  return { style: best, score: maxScore };
}

console.log("Test 1 [极简北欧风记账应用]:", matchQuery("极简北欧风记账应用").style.num, matchQuery("极简北欧风记账应用").style.nameZh, "score:", matchQuery("极简北欧风记账应用").score);
console.log("Test 2 [极客暗黑AI终端]:", matchQuery("极客暗黑AI终端").style.num, matchQuery("极客暗黑AI终端").style.nameZh, "score:", matchQuery("极客暗黑AI终端").score);
console.log("Test 3 [治愈系多巴胺打卡]:", matchQuery("治愈系多巴胺打卡").style.num, matchQuery("治愈系多巴胺打卡").style.nameZh, "score:", matchQuery("极简北欧风记账应用").score);
