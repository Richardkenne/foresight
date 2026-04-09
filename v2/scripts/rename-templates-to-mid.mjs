
const fs = require('fs');

function renameTemplates(filePath, keysToRename) {
  let lines = fs.readFileSync(filePath, 'utf8').split('
');
  
  for (let i = 0; i < lines.length; i++) {
    for (const key of keysToRename) {
      const regex = new RegExp('^  ' + key + ': \{');
      if (lines[i].match(regex)) {
        lines[i] = lines[i].replace(key + ': {', key + 'Mid: {');
        // Next line should be the title
        if (lines[i+1] && lines[i+1].includes("title: '")) {
          lines[i+1] = lines[i+1].replace(/title: '([^']+)'/, "title: '$1 (Analysis)'");
        }
        break;
      }
    }
  }
  
  fs.writeFileSync(filePath, lines.join('
'));
  console.log('Renamed ' + keysToRename.length + ' templates in ' + filePath);
}

// Business (skip upworkMoneyTree and app - already have variants)
renameTemplates('src/lib/templates/business.ts', [
  'startup', 'money', 'cafe', 'content', 'saas', 'freelance',
  'dropshipping', 'saas_scratch', 'side_hustle', 'buy_business',
  'affiliate_blog', 'paid_community', 'crypto_journey', 'ai_agency',
  'upwork_freelance'
]);

// Life
renameTemplates('src/lib/templates/life.ts', [
  'lend_money', 'lose_weight', 'learn_skill', 'youtube_guru', 'want_to_win'
]);

// Richard (skip richard_perfectionism - already at Summary level, agent creates Mid)
renameTemplates('src/lib/templates/richard.ts', [
  'richard_cafepedia', 'richard_move_abroad', 'richard_interfaith',
  'richard_break_pattern', 'richard_first_million',
  'richard_faith_business', 'richard_provider', 'richard_polymarket',
  'richard_leverage'
]);

console.log('All renames complete!');
