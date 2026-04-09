import type { Template } from '../templates';

export const lifeTemplates: Record<string, Template> = {

  // ═══════════════════════════════════════════════════════════════
  // LEND MONEY — Full Model (30+ nodes)
  // ═══════════════════════════════════════════════════════════════
  lend_money: {
    title: 'Friend Asks to Borrow Money',
    input: 'A friend without a job asks me to borrow money',
    nodes: [
      // Main path: 1-15
      { id: 1, type: 'state', label: '1000 people asked by a friend to lend money', x: 0, y: 200, prob: 100, desc: '43% of US adults have lent money to friends or family. Among millennials, 56% have. The average American has $3,300 in outstanding personal loans to people they know', source: 'Bankrate Financial Security Survey 2024 | LendingTree Personal Loan Survey 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-020', 'SR-026'] },
      { id: 2, type: 'state', label: 'Friend is unemployed and in financial distress', x: 200, y: 200, prob: 100, desc: 'The borrower has no current income source. 78% of Americans live paycheck to paycheck. Unemployment duration avg: 22 weeks (BLS 2024)', source: 'Bureau of Labor Statistics 2024 | CareerBuilder Survey 2024', sourceUrl: 'https://www.bls.gov/news.release/empsit.nr0.htm', sacredRoots: ['SR-020', 'SR-031'] },
      { id: 3, type: 'decision', label: 'Do you lend the money?', x: 400, y: 200, prob: 60, desc: '57-63% of people say yes when a close friend asks. Women (65%) more likely than men (55%). Guilt and social pressure are top drivers', source: 'Bankrate 2024 | LendingTree 2024 | NerdWallet Survey 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-017', 'SR-024'] },

      // NO branch: 20-29
      { id: 20, type: 'state', label: '400 say no to lending', x: 400, y: 450, prob: 100, desc: '37-43% decline the request. Top reasons: can\'t afford it (45%), learned from past mistakes (32%), principle against it (23%)', source: 'Bankrate 2024 | NerdWallet Survey 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-017', 'SR-005'] },
      { id: 21, type: 'gate', label: 'How does the friend react?', x: 600, y: 450, prob: 29, desc: '71% of friendships survive a declined loan. 29% experience damage. Reaction depends on how you decline and how desperate the friend is', source: 'Bankrate Relationship Survey 2024 | NerdWallet 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-010'] },
      { id: 22, type: 'outcome-good', label: 'Friendship survives, respected the boundary', x: 850, y: 350, prob: 100, desc: '71% of those who say no report the friendship survived. Setting boundaries is the #1 predictor of long-term relationship health', source: 'Bankrate 2024 | NerdWallet 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-017'] },
      { id: 23, type: 'state', label: 'Friend is upset but comes around', x: 850, y: 450, prob: 100, desc: '15% of friendships experience temporary tension after a declined loan. Most recover within 3-6 months', source: 'NerdWallet 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nerdwallet.com/article/finance/', sacredRoots: ['SR-011', 'SR-026'] },
      { id: 24, type: 'outcome-good', label: 'Friendship recovers after cooling period', x: 1100, y: 450, prob: 100, desc: 'Most temporary friction resolves. The declined lender avoids all financial risk', source: 'NerdWallet 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nerdwallet.com/article/finance/', sacredRoots: ['SR-011', 'SR-026'] },
      { id: 25, type: 'outcome-bad', label: 'Friend cuts you off over money', x: 850, y: 560, prob: 100, desc: '14% of declined requests end the friendship permanently. The friend feels betrayed or abandoned', source: 'Bankrate 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-010', 'SR-026'] },

      // YES branch continues: main 4-15
      { id: 4, type: 'action', label: '600 lend the money', x: 600, y: 200, prob: 100, desc: 'Average personal loan to friend/family: $1,500-$3,000 (Bankrate). Median: $500. 66% don\'t put anything in writing', source: 'Bankrate 2024 | LendingTree 2024 | Federal Reserve Survey of Consumer Finances 2023', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-024', 'SR-031'] },
      { id: 5, type: 'decision', label: 'Do you set terms in writing?', x: 800, y: 200, prob: 34, desc: 'Only 34% of personal lenders create a written agreement. Those who do are 2.3x more likely to be repaid', source: 'LendingTree 2024 | Nolo Legal Guide 2024', sourceUrl: 'https://www.lendingtree.com/personal/', sacredRoots: ['SR-017', 'SR-008'] },

      // No written terms: 30-39
      { id: 30, type: 'state', label: '396 lend with no written agreement', x: 800, y: -20, prob: 100, desc: '66% of personal loans have zero documentation. This makes legal recovery nearly impossible and sets up mismatched expectations', source: 'LendingTree 2024 | Nolo 2024', sourceUrl: 'https://www.lendingtree.com/personal/', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 31, type: 'trajectory', label: 'Informal loan: no timeline, no accountability', x: 1000, y: -20, prob: 100, desc: 'Without terms, both parties have different expectations. The lender expects repayment "soon," the borrower assumes "whenever"', source: 'NerdWallet 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nerdwallet.com/article/finance/', sacredRoots: ['SR-026', 'SR-011'] },
      { id: 32, type: 'bottleneck', label: 'Does the friend repay (no agreement)?', x: 1200, y: -20, prob: 38, desc: 'Without written terms, only 38% repay in full. With terms, 57% repay. Written agreements increase repayment by 50%', source: 'Bankrate 2024 | LendingTree 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-008'] },
      { id: 33, type: 'state', label: 'Friend avoids you / ghosting begins', x: 1200, y: -180, prob: 100, desc: '62% of unpaid informal loans lead to the borrower avoiding the lender. "They don\'t answer my calls anymore"', source: 'NerdWallet 2024 | Bankrate 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nerdwallet.com/article/finance/', sacredRoots: ['SR-010', 'SR-026'] },
      { id: 34, type: 'decision', label: 'Do you confront them?', x: 1400, y: -180, prob: 45, desc: '55% of lenders avoid confrontation entirely. Of those who confront, 60% escalate the conflict', source: 'NerdWallet 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nerdwallet.com/article/finance/', sacredRoots: ['SR-001', 'SR-026'] },
      { id: 35, type: 'outcome-bad', label: 'Lost money, lost friend, silent resentment', x: 1600, y: -240, prob: 100, desc: 'The silent loss: money gone, friendship eroded, both sides resentful but neither speaks up', source: 'Bankrate 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-031'] },
      { id: 36, type: 'outcome-bad', label: 'Confrontation damages relationship further', x: 1600, y: -130, prob: 100, desc: 'Asking for money back creates guilt-shame dynamics. 46% say lending/borrowing damaged a relationship', source: 'Bankrate 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-010'] },
      { id: 37, type: 'outcome-good', label: 'Repaid informally, friendship OK', x: 1400, y: 60, prob: 100, desc: '38% of informal loans are repaid. Of those, most friendships survive intact', source: 'Bankrate 2024 | LendingTree 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-024'] },

      // Written terms path: 6-15
      { id: 6, type: 'state', label: '204 lend with written terms', x: 1000, y: 200, prob: 100, desc: '34% formalize the loan. Written terms include: amount, repayment schedule, interest (if any), consequences of default', source: 'LendingTree 2024 | Nolo Legal Guide 2024', sourceUrl: 'https://www.lendingtree.com/personal/', sacredRoots: ['SR-017', 'SR-008'] },
      { id: 7, type: 'bottleneck', label: 'Does the friend repay (with agreement)?', x: 1200, y: 200, prob: 57, desc: '57% repayment rate with written agreement vs 38% without. Still, 43% default even with documentation', source: 'LendingTree 2024 | Bankrate 2024', sourceUrl: 'https://www.lendingtree.com/personal/', sacredRoots: ['SR-026', 'SR-008'] },

      // Written + not repaid: 40-49
      { id: 40, type: 'state', label: 'Default with written agreement', x: 1200, y: 380, prob: 100, desc: '43% default even with written terms. Average amount lost: $3,257', source: 'Bankrate 2024 | LendingTree 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-031'] },
      { id: 41, type: 'decision', label: 'Pursue legal action?', x: 1400, y: 380, prob: 15, desc: 'Only 15% of personal loan defaults go to small claims court. Filing fee: $30-$75. Max claim varies by state ($2,500-$25,000)', source: 'Nolo Small Claims Guide 2024 | National Center for State Courts 2024', sourceUrl: 'https://www.nolo.com/legal-encyclopedia/small-claims-court', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 42, type: 'state', label: 'File in small claims court', x: 1600, y: 320, prob: 100, desc: 'Small claims court: no lawyer needed, $30-75 filing fee, judgment in 30-60 days. But collecting is another story', source: 'Nolo 2024 | National Center for State Courts', sourceUrl: 'https://www.nolo.com/legal-encyclopedia/small-claims-court', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 43, type: 'bottleneck', label: 'Can you actually collect?', x: 1800, y: 320, prob: 25, desc: 'Winning a judgment and collecting are different things. Only 20-30% of small claims judgments are ever collected, especially from unemployed defendants', source: 'National Center for State Courts 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.ncsc.org/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 44, type: 'outcome-bad', label: 'Won judgment, can\'t collect -- friendship destroyed', x: 2050, y: 260, prob: 100, desc: 'You have a legal win but an uncollectable judgment. The friendship is permanently over. Net loss: money + legal fees + relationship', source: 'Nolo 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nolo.com/legal-encyclopedia/small-claims-court', sacredRoots: ['SR-031', 'SR-026'] },
      { id: 45, type: 'outcome-good', label: 'Collected via court order', x: 2050, y: 380, prob: 100, desc: 'Rare outcome: money recovered through wage garnishment or bank levy. Friendship is over but money is back', source: 'Nolo 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nolo.com/legal-encyclopedia/small-claims-court', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 46, type: 'outcome-bad', label: 'Write it off as a loss, learn the lesson', x: 1600, y: 450, prob: 100, desc: '85% of defaulted personal loans are simply absorbed as a loss. Average loss: $3,257. "Consider it a gift or don\'t lend"', source: 'Bankrate 2024 | LendingTree 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-031', 'SR-011'] },

      // Written + repaid path: 8-15
      { id: 8, type: 'state', label: 'Friend repays on schedule', x: 1400, y: 200, prob: 100, desc: '57% of formal loans are repaid. Average repayment time: 3-6 months for small loans, 1-2 years for larger ones', source: 'LendingTree 2024', sourceUrl: 'https://www.lendingtree.com/personal/', sacredRoots: ['SR-026', 'SR-008'] },
      { id: 9, type: 'gate', label: 'Impact on the relationship?', x: 1600, y: 200, prob: 54, desc: '54% say the relationship improved or stayed the same after successful repayment. 46% say it was damaged regardless -- the power dynamic shifted permanently', source: 'Bankrate 2024 | NerdWallet 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-020'] },
      { id: 10, type: 'outcome-good', label: 'Money back, friendship stronger', x: 1850, y: 120, prob: 100, desc: 'Best case: 25% of all loans. Repaid + relationship intact or improved. Trust deepened through the experience', source: 'Bankrate 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-024'] },
      { id: 11, type: 'state', label: 'Repaid but relationship feels different', x: 1850, y: 200, prob: 100, desc: 'Money is back but the dynamic changed. Power imbalance during the loan period created resentment or awkwardness', source: 'NerdWallet 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nerdwallet.com/article/finance/', sacredRoots: ['SR-026', 'SR-005'] },
      { id: 12, type: 'outcome-bad', label: 'Repaid, but friendship damaged by the dynamic', x: 2050, y: 200, prob: 100, desc: '21% of successfully repaid loans still result in a weakened friendship. "Things were never the same after"', source: 'Bankrate 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-020'] },
      { id: 13, type: 'outcome-bad', label: 'Lost money AND the friend', x: 1850, y: 300, prob: 100, desc: '37% of all lenders report losing both money and the relationship. The worst outcome and the most common one for informal loans', source: 'Bankrate 2024 | Federal Reserve SCF 2023', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-031'] },

      // Alternative approach: 50-55
      { id: 50, type: 'action', label: 'Offer help instead of cash (job leads, food, bills)', x: 400, y: -100, prob: 100, desc: 'Financial advisors recommend: offer specific help (pay a bill, buy groceries) rather than handing cash. This preserves dignity and avoids the loan trap', source: 'NerdWallet 2024 | Dave Ramsey Financial Peace 2024', sourceUrl: 'https://www.nerdwallet.com/article/finance/', sacredRoots: ['SR-024', 'SR-017'] },
      { id: 51, type: 'outcome-good', label: 'Helped without creating a debtor dynamic', x: 600, y: -100, prob: 100, desc: 'Non-cash help avoids the lender-borrower power imbalance. Friendship preserved, practical needs met, no repayment anxiety', source: 'NerdWallet 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nerdwallet.com/article/finance/', sacredRoots: ['SR-024', 'SR-026'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      // NO branch
      { from: 3, to: 20, label: 'no' },
      { from: 20, to: 21 },
      { from: 21, to: 22, label: 'yes' },
      { from: 21, to: 23, label: 'partial' },
      { from: 21, to: 25, label: 'no' },
      { from: 23, to: 24 },
      // YES branch
      { from: 3, to: 4, label: 'yes' },
      { from: 4, to: 5 },
      // No written terms
      { from: 5, to: 30, label: 'no' },
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'fail' },
      { from: 32, to: 37, label: 'pass' },
      { from: 33, to: 34 },
      { from: 34, to: 35, label: 'no' },
      { from: 34, to: 36, label: 'yes' },
      // Written terms
      { from: 5, to: 6, label: 'yes' },
      { from: 6, to: 7 },
      { from: 7, to: 40, label: 'fail' },
      { from: 7, to: 8, label: 'pass' },
      // Default with agreement
      { from: 40, to: 41 },
      { from: 41, to: 42, label: 'yes' },
      { from: 41, to: 46, label: 'no' },
      { from: 42, to: 43 },
      { from: 43, to: 44, label: 'fail' },
      { from: 43, to: 45, label: 'pass' },
      // Repaid path
      { from: 8, to: 9 },
      { from: 9, to: 10, label: 'yes' },
      { from: 9, to: 11, label: 'partial' },
      { from: 9, to: 13, label: 'no' },
      { from: 11, to: 12 },
      // Alternative approach
      { from: 3, to: 50 },
      { from: 50, to: 51 },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LEND MONEY — Analysis (Mid)
  // ═══════════════════════════════════════════════════════════════
  lend_moneyMid: {
    title: 'Friend Asks to Borrow Money (Analysis)',
    input: 'A friend without a job asks me to borrow money',
    nodes: [
      { id: 1, type: 'start', label: 'Friend asks for money', x: 0, y: 140, prob: 100, desc: '43% of people have lent to friends/family', source: 'Bankrate 2025 | LendingTree 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-020', 'SR-026'] },
      { id: 2, type: 'decision', label: 'Do you lend?', x: 240, y: 140, prob: 60, desc: '60% say yes when close friend asks', source: 'LendingTree 2025 | Bankrate 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-017', 'SR-024'] },
      { id: 3, type: 'outcome-good', label: 'Say no, relationship survives', x: 240, y: 320, prob: 100, desc: '71% of those who say no keep the friendship', source: 'Bankrate 2025 | NerdWallet 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 4, type: 'action', label: 'You give them money', x: 480, y: 140, prob: 100, desc: 'Avg personal loan to friend: $500-$3K', source: 'LendingTree 2025 | Federal Reserve Survey 2025', sourceUrl: 'https://www.federalreserve.gov/publications.htm', sacredRoots: ['SR-024', 'SR-020'] },
      { id: 5, type: 'bottleneck', label: 'Do they pay you back?', x: 720, y: 140, prob: 47, desc: '53% of lenders lose money on personal loans', source: 'Bankrate 2025 | LendingTree 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-026', 'SR-019'] },
      { id: 6, type: 'outcome-bad', label: 'Never paid back', x: 720, y: 320, prob: 100, desc: '$3,257 avg amount lost forever', source: 'LendingTree 2025 | Bankrate 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-026', 'SR-021'] },
      { id: 7, type: 'decision', label: 'Does it damage the relationship?', x: 960, y: 140, prob: 46, desc: '46% say lending damaged a relationship', source: 'Bankrate 2025 | NerdWallet 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-022', 'SR-026'] },
      { id: 8, type: 'outcome-good', label: 'Paid back, friendship intact', x: 1200, y: 80, prob: 100, desc: 'Only ~25% of all loans end well', source: 'Bankrate 2025 | LendingTree 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-026', 'SR-019'] },
      { id: 9, type: 'outcome-bad', label: 'Lost money AND the friend', x: 1200, y: 240, prob: 100, desc: '37% lost a relationship over money', source: 'Bankrate 2025 | Federal Reserve Survey 2025', sourceUrl: 'https://www.federalreserve.gov/publications.htm', sacredRoots: ['SR-026', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5 }, { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 9, label: 'yes' }, { from: 7, to: 8, label: 'no' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LEND MONEY — Summary (Min)
  // ═══════════════════════════════════════════════════════════════
  lend_moneyMin: {
    title: 'Friend Asks to Borrow Money (Summary)',
    input: 'A friend without a job asks me to borrow money',
    nodes: [
      { id: 1, type: 'state', label: '1000 people asked to lend to a friend', x: 0, y: 150, prob: 100, desc: '43% of adults have lent money to friends/family. Average amount: $1,500-$3,000', source: 'Bankrate 2024 | LendingTree 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-020', 'SR-026'] },
      { id: 2, type: 'decision', label: 'Lend the money? (60% say yes)', x: 250, y: 150, prob: 60, desc: '57-63% say yes when a close friend asks', source: 'Bankrate 2024 | LendingTree 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-024', 'SR-017'] },
      { id: 3, type: 'outcome-good', label: 'Say no -- 71% keep the friendship', x: 250, y: 350, prob: 100, desc: 'Declining preserves finances and usually the friendship', source: 'Bankrate 2024 | NerdWallet 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 4, type: 'bottleneck', label: 'Do they repay? (47% do)', x: 500, y: 150, prob: 47, desc: '53% of personal loans are never repaid. Average loss: $3,257', source: 'Bankrate 2024 | LendingTree 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: 'Lost money -- 37% also lose the friend', x: 500, y: 350, prob: 100, desc: '53% never repaid. Of those, 37% of all lenders report losing the relationship too', source: 'Bankrate 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-031', 'SR-026'] },
      { id: 6, type: 'outcome-good', label: 'Repaid, friendship intact (~25%)', x: 750, y: 100, prob: 100, desc: 'Only about 25% of all personal loans end with both money returned and friendship preserved', source: 'Bankrate 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-024'] },
      { id: 7, type: 'outcome-bad', label: 'Repaid but relationship damaged (21%)', x: 750, y: 250, prob: 100, desc: '46% say lending damaged a relationship -- even when repaid, the power dynamic often shifts permanently', source: 'Bankrate 2024 | NerdWallet 2024', sourceUrl: 'https://www.bankrate.com/personal-finance/financial-security-survey/', sacredRoots: ['SR-026', 'SR-020'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'no' },
      { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5, label: 'fail' },
      { from: 4, to: 6, label: 'pass' },
      { from: 4, to: 7, label: 'pass' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LOSE WEIGHT — Full Model (30+ nodes)
  // ═══════════════════════════════════════════════════════════════
  lose_weight: {
    title: 'Lose Weight & Keep It Off',
    input: 'I want to lose weight',
    nodes: [
      // Main path: 1-15
      { id: 1, type: 'state', label: '1000 people decide to lose weight', x: 0, y: 200, prob: 100, desc: '49% of US adults attempted weight loss in the past 12 months (CDC NHANES 2023). Global obesity: 1 billion+ people (WHO 2024). The desire is universal', source: 'CDC NHANES 2023-2024 | WHO World Obesity Report 2024', sourceUrl: 'https://www.cdc.gov/nchs/nhanes/', sacredRoots: ['SR-005', 'SR-011'] },
      { id: 2, type: 'action', label: 'Choose a method: diet, gym, or both', x: 200, y: 200, prob: 100, desc: 'Top methods: calorie restriction (65%), exercise (58%), intermittent fasting (24%), keto (15%), GLP-1 drugs (6%). Most combine 2+ methods', source: 'International Food Information Council 2024 | CDC NHANES 2023', sourceUrl: 'https://foodinsight.org/food-and-health-survey/', sacredRoots: ['SR-017', 'SR-008'] },
      { id: 3, type: 'gate', label: 'Which approach do you commit to?', x: 450, y: 200, prob: 40, desc: 'Method choice matters less than adherence. But adherence varies dramatically by method. Diet-only: 45% stick 1mo. Gym-only: 36%. Combined: 28%. GLP-1: 68%', source: 'IHRSA 2024 | Strava Year in Sport 2024 | NEJM GLP-1 trials 2024', sourceUrl: 'https://www.ihrsa.org/publications/', sacredRoots: ['SR-017', 'SR-012'] },

      // NO path (diet only, quit early): 20-29
      { id: 20, type: 'action', label: 'Diet only -- calorie restriction or fad diet', x: 450, y: 420, prob: 100, desc: '45% of people attempt diet-only approaches. Avg calorie deficit attempted: 500-1000 cal/day. Most popular: intermittent fasting, keto, Mediterranean', source: 'International Food Information Council 2024', sourceUrl: 'https://foodinsight.org/food-and-health-survey/', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 21, type: 'bottleneck', label: 'Survive the first 3 weeks?', x: 650, y: 420, prob: 36, desc: '64% quit within 30 days. "Quitter\'s Day" is January 19th -- the most common day to abandon resolutions. Willpower depletes without habit architecture', source: 'Strava Year in Sport 2024 | British Journal of Sports Medicine 2024', sourceUrl: 'https://www.strava.com/year-in-sport', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 22, type: 'outcome-bad', label: 'Quit after 2-3 weeks', x: 850, y: 500, prob: 100, desc: 'Average gym visits: 4.7x/month (despite paying for unlimited). Most diets abandoned by day 19. "I\'ll start again Monday" cycle begins', source: 'IHRSA 2024 | RunRepeat Gym Survey 2024', sourceUrl: 'https://www.ihrsa.org/publications/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 23, type: 'state', label: 'Metabolic adaptation kicks in', x: 850, y: 360, prob: 100, desc: 'Body reduces BMR by 10-15% after 2-3 weeks of calorie deficit. This is the "plateau" -- your body fights back. Hunger hormones (ghrelin) spike 20-30%', source: 'NEJM 2024 | Lancet Diabetes & Endocrinology 2024', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-014'] },
      { id: 24, type: 'bottleneck', label: 'Push through the plateau?', x: 1050, y: 360, prob: 35, desc: '65% who hit a plateau give up. Of those who persist, most need to adjust method (lower calories further or add exercise)', source: 'American Journal of Clinical Nutrition 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://academic.oup.com/ajcn', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 25, type: 'outcome-bad', label: 'Plateau frustration -- regain begins', x: 1050, y: 500, prob: 100, desc: 'Weight regain starts within weeks of quitting. 80% of lost weight is regained within 12 months. The body "overshoots" -- people often end heavier than they started', source: 'American Journal of Clinical Nutrition 2024 | UCLA Meta-Analysis 2023', sourceUrl: 'https://academic.oup.com/ajcn', sacredRoots: ['SR-011', 'SR-007'] },

      // PARTIAL path (gym + diet combined): 30-39
      { id: 30, type: 'action', label: 'Gym + diet combined approach', x: 450, y: -20, prob: 100, desc: '28% adherence at 3 months for combined approaches. But those who stick have 2x better outcomes than diet-only. Resistance training preserves muscle mass during deficit', source: 'ACSM Guidelines 2024 | IHRSA 2024', sourceUrl: 'https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 31, type: 'bottleneck', label: 'Still going at 3 months?', x: 650, y: -20, prob: 28, desc: 'Only 28% of gym memberships are used regularly after 90 days. The "attendance cliff" hits between month 2-3. 50% of January signups are gone by March', source: 'IHRSA 2024 | Strava 2024', sourceUrl: 'https://www.ihrsa.org/publications/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 32, type: 'outcome-bad', label: 'Gym abandoned, paying for nothing', x: 650, y: -180, prob: 100, desc: '$46.3 billion/year in unused gym memberships globally. Average member pays $58/month, goes 4.7x/month', source: 'IHRSA 2024 | RunRepeat 2024', sourceUrl: 'https://www.ihrsa.org/publications/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 33, type: 'state', label: 'Lost 5-10% body weight', x: 850, y: -20, prob: 100, desc: 'Those who persist 3+ months typically lose 5-10% body weight. This is the "clinically significant" threshold -- health markers improve dramatically', source: 'NEJM 2024 | American Diabetes Association 2024', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 34, type: 'trajectory', label: 'Maintenance phase begins -- the real challenge', x: 1050, y: -20, prob: 100, desc: 'Losing weight is the easy part. Maintenance requires permanent lifestyle change. Metabolic rate stays suppressed 6-12% even at goal weight (The Biggest Loser study)', source: 'Obesity Journal 2024 | NIH Biggest Loser Follow-up 2024', sourceUrl: 'https://onlinelibrary.wiley.com/journal/1930739x', sacredRoots: ['SR-011', 'SR-008'] },
      { id: 35, type: 'bottleneck', label: 'Maintain for 1 year?', x: 1250, y: -20, prob: 40, desc: '60% regain within 12 months. The body has a "set point" it fights to return to. Requires 150-300 min/week of exercise + permanent dietary changes', source: 'National Weight Control Registry 2024 | ACSM 2024', sourceUrl: 'https://www.nwcr.ws/', sacredRoots: ['SR-011', 'SR-008'] },
      { id: 36, type: 'state', label: 'Regain 50-100% of lost weight', x: 1250, y: -180, prob: 100, desc: '80% regain most weight within 1-2 years. Average regain: 33% of lost weight in year 1, 66% by year 2. The yo-yo cycle restarts', source: 'NEJM 2024 | American Journal of Clinical Nutrition 2024', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-005'] },
      { id: 37, type: 'outcome-bad', label: 'Yo-yo dieting cycle -- worse metabolic health', x: 1450, y: -180, prob: 100, desc: 'Repeated weight cycling increases cardiovascular risk by 15-20%. Each cycle makes the next attempt harder due to metabolic adaptation', source: 'Lancet 2024 | European Heart Journal 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.thelancet.com/', sacredRoots: ['SR-011', 'SR-014'] },

      // YES path (GLP-1 / medical): 40-49
      { id: 40, type: 'action', label: 'GLP-1 medication (Ozempic/Wegovy/Mounjaro)', x: 450, y: 200, prob: 100, desc: 'GLP-1 agonists: the biggest disruption in obesity treatment in decades. Semaglutide (Wegovy): 15-17% body weight loss. Tirzepatide (Mounjaro): 20-26%. Cost: $800-1,400/month without insurance', source: 'NEJM STEP Trials 2024 | SURMOUNT Trials 2024', sourceUrl: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2206038', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 41, type: 'bottleneck', label: 'Can you afford/access it?', x: 650, y: 200, prob: 30, desc: 'Only 30% of people who want GLP-1s can access them. Barriers: cost ($800-1,400/mo), insurance denial (50%+ of claims), global shortage (2023-2025). 1 in 8 US adults have tried one', source: 'KFF Health Tracking Poll 2024 | IQVIA 2024', sourceUrl: 'https://www.kff.org/health-costs/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 42, type: 'outcome-bad', label: 'Can\'t afford or access medication', x: 650, y: 80, prob: 100, desc: '70% priced out or denied coverage. Many turn to compounded versions (legal gray area) or black market', source: 'KFF 2024 | IQVIA Market Report 2024', sourceUrl: 'https://www.kff.org/health-costs/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 43, type: 'state', label: 'On GLP-1: losing 15-20% body weight', x: 850, y: 200, prob: 100, desc: 'Average weight loss on semaglutide: 15-17% at 68 weeks. Tirzepatide: 20-26%. Side effects: nausea (44%), vomiting (24%), diarrhea (30%), but most mild-moderate', source: 'NEJM STEP 1 Trial 2024 | SURMOUNT-1 2024', sourceUrl: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2206038', sacredRoots: ['SR-011', 'SR-017'] },
      { id: 44, type: 'decision', label: 'Stop the medication?', x: 1050, y: 200, prob: 67, desc: '67% of GLP-1 users stop within 12 months (cost, side effects, or feeling "done"). Of those who stop, 67% regain 2/3 of lost weight within 1 year', source: 'STEP 1 Extension Trial 2024 | Prime Therapeutics 2024', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 45, type: 'state', label: 'Stopped GLP-1: rapid regain begins', x: 1250, y: 120, prob: 100, desc: '67% of weight is regained within 1 year of stopping. Appetite suppression disappears almost immediately. Without lifestyle changes, results are temporary', source: 'STEP 1 Extension Trial (NEJM 2024)', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-008'] },
      { id: 46, type: 'outcome-bad', label: 'Regained weight after stopping medication', x: 1450, y: 120, prob: 100, desc: 'The GLP-1 paradox: effective while on it, but most can\'t afford it forever. Without permanent behavior change, it\'s a temporary fix', source: 'STEP 1 Extension 2024 | JAMA 2024', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 47, type: 'state', label: 'Staying on GLP-1 long-term', x: 1250, y: 280, prob: 100, desc: '33% stay on GLP-1 past 12 months. Ongoing cost: $10K-17K/year. Long-term safety data still limited (5-year data expected 2027)', source: 'IQVIA 2024 | FDA Post-Market Surveillance 2024', sourceUrl: 'https://www.fda.gov/drugs/', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 48, type: 'outcome-good', label: 'Sustained loss with ongoing medication', x: 1450, y: 280, prob: 100, desc: 'Those who stay on GLP-1 maintain 15-20% weight loss. Best outcomes combine medication + exercise + dietary changes. But it\'s a lifelong commitment and cost', source: 'NEJM 2024 | STEP 5 Trial 2024', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-012'] },

      // Long-term success path: 50-55
      { id: 50, type: 'bottleneck', label: 'Keep weight off 5+ years?', x: 1450, y: -20, prob: 12, desc: 'Only 5-12% maintain significant weight loss for 5+ years. The National Weight Control Registry tracks these rare "maintainers" -- avg: 30 lbs lost, kept off 5.5 years', source: 'National Weight Control Registry 2024 | NEJM 2024', sourceUrl: 'https://www.nwcr.ws/', sacredRoots: ['SR-011', 'SR-008'] },
      { id: 51, type: 'outcome-good', label: 'Permanent lifestyle transformation (5-12%)', x: 1700, y: -80, prob: 100, desc: 'Success formula (NWCR data): 78% eat breakfast daily, 75% weigh weekly, 62% watch <10hr TV/week, 90% exercise ~1hr/day. It becomes identity, not a diet', source: 'National Weight Control Registry 2024', sourceUrl: 'https://www.nwcr.ws/', sacredRoots: ['SR-005', 'SR-012'] },
      { id: 52, type: 'outcome-bad', label: 'Lost the battle: 88-95% regain everything', x: 1700, y: 40, prob: 100, desc: 'The default outcome. Average person attempts 4-7 diets per year. The diet industry ($254B globally) profits from repeat customers, not cured ones', source: 'CDC NHANES 2023 | International Journal of Obesity 2024 | Statista 2024', sourceUrl: 'https://www.cdc.gov/nchs/nhanes/', sacredRoots: ['SR-011', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      // NO path (diet only)
      { from: 3, to: 20, label: 'no' },
      { from: 20, to: 21 },
      { from: 21, to: 22, label: 'fail' },
      { from: 21, to: 23, label: 'pass' },
      { from: 23, to: 24 },
      { from: 24, to: 25, label: 'fail' },
      { from: 24, to: 33, label: 'pass' },
      // PARTIAL path (gym + diet)
      { from: 3, to: 30, label: 'partial' },
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'fail' },
      { from: 31, to: 33, label: 'pass' },
      { from: 33, to: 34 }, { from: 34, to: 35 },
      { from: 35, to: 36, label: 'fail' },
      { from: 35, to: 50, label: 'pass' },
      { from: 36, to: 37 },
      // YES path (GLP-1)
      { from: 3, to: 40, label: 'yes' },
      { from: 40, to: 41 },
      { from: 41, to: 42, label: 'fail' },
      { from: 41, to: 43, label: 'pass' },
      { from: 43, to: 44 },
      { from: 44, to: 45, label: 'yes' },
      { from: 44, to: 47, label: 'no' },
      { from: 45, to: 46 },
      { from: 47, to: 48 },
      // Long-term
      { from: 50, to: 51, label: 'pass' },
      { from: 50, to: 52, label: 'fail' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LOSE WEIGHT — Analysis (Mid)
  // ═══════════════════════════════════════════════════════════════
  lose_weightMid: {
    title: 'Lose Weight & Keep It Off (Analysis)',
    input: 'I want to lose weight',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to lose weight', x: 0, y: 120, prob: 100, desc: '49% of adults tried in the past year', source: 'CDC NHANES 2025 | WHO Global Report 2025', sourceUrl: 'https://www.who.int/data', sacredRoots: ['SR-011', 'SR-005'] },
      { id: 2, type: 'action', label: 'Start a diet / gym', x: 240, y: 120, prob: 100, desc: 'Jan gym sign-ups spike 50-67%', source: 'IHRSA Global Report 2025 | Strava Year in Sport 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.ihrsa.org/publications/', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 3, type: 'bottleneck', label: 'Survive past week 3', x: 480, y: 120, prob: 36, desc: '64% quit new habits within 30 days', source: 'Strava Year in Sport 2025 | British Journal of Sports Medicine 2025', sourceUrl: 'https://www.strava.com/year-in-sport', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 4, type: 'outcome-bad', label: 'Quit after 2-3 weeks', x: 480, y: 300, prob: 100, desc: 'Average gym visits: 4.7x/month', source: 'IHRSA Global Report 2025 | RunRepeat 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.ihrsa.org/publications/', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Lose 5%+ body weight', x: 720, y: 120, prob: 50, desc: '50% of dieters hit initial target', source: 'NEJM 2025 | Lancet 2025', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 6, type: 'outcome-bad', label: 'No visible progress, stop', x: 720, y: 300, prob: 100, desc: 'Metabolic adaptation slows loss', source: 'Lancet 2025 | Nature Medicine 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.thelancet.com/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'bottleneck', label: 'Keep it off 1 year', x: 960, y: 120, prob: 40, desc: '80% regain within 1-2 years', source: 'American Journal of Clinical Nutrition 2025 | NEJM 2025', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-010'] },
      { id: 8, type: 'outcome-bad', label: 'Regain all the weight', x: 960, y: 300, prob: 100, desc: '95% regain within 5 years', source: 'NEJM 2025 | UCLA Meta-Analysis 2023', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-005'] },
      { id: 9, type: 'outcome-good', label: 'Sustained weight loss 5yr+', x: 1200, y: 60, prob: 100, desc: 'Only 5-10% keep weight off long-term', source: 'National Weight Control Registry 2025 | NEJM 2025', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 10, type: 'outcome-bad', label: 'Yo-yo cycle repeats', x: 1200, y: 220, prob: 100, desc: 'Avg person attempts 4-7 diets/year', source: 'CDC NHANES 2025 | International Journal of Obesity 2025', sourceUrl: 'https://www.cdc.gov/nchs/nhanes/', sacredRoots: ['SR-011', 'SR-005'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 7, to: 10, label: 'fail' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LOSE WEIGHT — Summary (Min)
  // ═══════════════════════════════════════════════════════════════
  lose_weightMin: {
    title: 'Lose Weight & Keep It Off (Summary)',
    input: 'I want to lose weight',
    nodes: [
      { id: 1, type: 'state', label: '1000 people start a weight loss attempt', x: 0, y: 150, prob: 100, desc: '49% of adults try to lose weight each year. $254B global diet industry', source: 'CDC NHANES 2023 | WHO 2024', sourceUrl: 'https://www.cdc.gov/nchs/nhanes/', sacredRoots: ['SR-005', 'SR-011'] },
      { id: 2, type: 'bottleneck', label: 'Survive past 3 weeks? (36%)', x: 250, y: 150, prob: 36, desc: '64% quit within the first 30 days. January 19th is "Quitter\'s Day"', source: 'Strava 2024 | IHRSA 2024', sourceUrl: 'https://www.strava.com/year-in-sport', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 3, type: 'outcome-bad', label: '640 quit in the first month', x: 250, y: 350, prob: 100, desc: 'Most give up before seeing results. Average gym attendance: 4.7x/month', source: 'IHRSA 2024', sourceUrl: 'https://www.ihrsa.org/publications/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 4, type: 'bottleneck', label: 'Lose 5%+ and keep it 1yr? (7%)', x: 500, y: 150, prob: 20, desc: '50% lose initial weight but 80% regain within 12 months. Net: ~7% of original 1000 maintain at 1 year', source: 'NEJM 2024 | National Weight Control Registry 2024', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 5, type: 'outcome-bad', label: 'Regain everything -- yo-yo cycle', x: 500, y: 350, prob: 100, desc: '80% regain within 1-2 years. Average person attempts 4-7 diets per year', source: 'NEJM 2024 | UCLA Meta-Analysis 2023', sourceUrl: 'https://www.nejm.org/', sacredRoots: ['SR-011', 'SR-005'] },
      { id: 6, type: 'outcome-good', label: '50-120 keep it off 5+ years (5-12%)', x: 750, y: 100, prob: 100, desc: 'Only 5-12% maintain significant weight loss long-term. Keys: daily exercise, weekly weighing, breakfast, identity shift', source: 'National Weight Control Registry 2024', sourceUrl: 'https://www.nwcr.ws/', sacredRoots: ['SR-005', 'SR-012'] },
      { id: 7, type: 'outcome-bad', label: '880-950 back to starting weight or heavier', x: 750, y: 250, prob: 100, desc: '88-95% of all weight loss attempts fail long-term. The diet industry profits from repeat customers', source: 'International Journal of Obesity 2024 | CDC 2023', sourceUrl: 'https://www.cdc.gov/nchs/nhanes/', sacredRoots: ['SR-011', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' },
      { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'fail' },
      { from: 4, to: 6, label: 'pass' },
      { from: 4, to: 7, label: 'fail' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LEARN SKILL — Full Model (30+ nodes)
  // ═══════════════════════════════════════════════════════════════
  learn_skill: {
    title: 'Learn a New Skill',
    input: 'I want to learn a new skill',
    nodes: [
      // Main path: 1-15
      { id: 1, type: 'state', label: '1000 people decide to learn a new skill', x: 0, y: 200, prob: 100, desc: '74% of workers want to learn new skills (PwC 2024). Global online learning market: $400B+. Skill half-life has shrunk from 10-15 years to 2.5-5 years (WEF 2024)', source: 'PwC Global Workforce Survey 2024 | World Economic Forum Future of Jobs 2024 | HolonIQ 2024', sourceUrl: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', sacredRoots: ['SR-036', 'SR-007'] },
      { id: 2, type: 'action', label: 'Choose a learning method', x: 200, y: 200, prob: 100, desc: 'Methods: MOOC (45%), YouTube (30%), bootcamp (10%), books/mentors (15%). Average course price: $12-50 (Udemy), $39-79/mo (Coursera Plus), $10K-20K (bootcamp)', source: 'Class Central 2024 | HolonIQ 2024 | Course Report 2024', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-036', 'SR-017'] },
      { id: 3, type: 'gate', label: 'Which learning path?', x: 450, y: 200, prob: 15, desc: 'Method determines completion probability. Bootcamps: 70-92% completion. University: 50-70%. MOOCs: 3-15%. Self-directed YouTube: <5%. Accountability is the differentiator', source: 'Class Central 2024 | Course Report 2024 | MIT/Harvard MOOC Study 2024', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-012', 'SR-017'] },

      // NO path (self-directed / MOOC): 20-29
      { id: 20, type: 'action', label: 'Self-directed: MOOC or YouTube', x: 450, y: 450, prob: 100, desc: '75% choose the cheapest/easiest path. Buy a Udemy course ($12-15 on sale) or start a YouTube playlist. Zero accountability, zero feedback', source: 'Udemy Business Report 2024 | Class Central 2024', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-036', 'SR-031'] },
      { id: 21, type: 'state', label: 'Week 1: motivated, watching videos', x: 650, y: 450, prob: 100, desc: 'Average learner watches 12% of purchased course content. Peak engagement: first 48 hours. The "Netflix effect" -- consuming without practicing', source: 'Udemy Business Report 2024 | EdTech industry data 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 22, type: 'bottleneck', label: 'Complete the course?', x: 850, y: 450, prob: 7, desc: 'MOOC completion rate: 3-15%. Udemy average: 7%. Coursera: 5-10%. Most abandon after week 2 when it gets difficult. "Tutorial hell" begins', source: 'MIT/Harvard MOOC Study 2024 | Class Central Annual Report 2024', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 23, type: 'outcome-bad', label: 'Abandoned -- 930 of 1000 never finish', x: 1050, y: 550, prob: 100, desc: 'Average Udemy user has 8.4 purchased courses, completed 0.67. The "course collector" syndrome. $4.5B spent on courses never completed', source: 'Udemy Business Report 2024 | Class Central 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 24, type: 'state', label: 'Completed course but no practice', x: 1050, y: 380, prob: 100, desc: 'Ebbinghaus forgetting curve: 70% of learned material forgotten within 24 hours without practice. 90% forgotten within 1 month. Knowledge without application = nothing', source: 'Ebbinghaus Forgetting Curve | Learning Science Research 2024', sourceUrl: 'https://en.wikipedia.org/wiki/Forgetting_curve', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 25, type: 'bottleneck', label: 'Actually practice the skill?', x: 1250, y: 380, prob: 30, desc: 'Only 30% of course completers do deliberate practice. 20 hours = functional competence (Kaufman). But most never start practicing because "I\'m not ready yet"', source: 'Josh Kaufman 2024 | Ericsson Deliberate Practice Research 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://joshkaufman.net/', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 26, type: 'outcome-bad', label: 'Tutorial hell: watched everything, built nothing', x: 1250, y: 500, prob: 100, desc: 'The most common trap in online learning. Consumption feels like progress but produces zero capability. "I know how to do it" vs "I can do it"', source: 'EdTech Industry Analysis 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-012', 'SR-007'] },

      // PARTIAL path (structured program): 30-39
      { id: 30, type: 'action', label: 'Structured program: bootcamp or university', x: 450, y: -30, prob: 100, desc: 'Bootcamp avg cost: $13,584. Duration: 12-24 weeks. University certificate: $2K-10K. Higher cost = higher commitment. Sunk cost fallacy works in your favor here', source: 'Course Report 2024 | BestColleges 2024', sourceUrl: 'https://www.coursereport.com/reports/coding-bootcamp-market-size-research-2024', sacredRoots: ['SR-036', 'SR-031'] },
      { id: 31, type: 'bottleneck', label: 'Complete the bootcamp?', x: 650, y: -30, prob: 80, desc: 'Bootcamp completion: 70-92% (vs 3-15% for MOOCs). Key factors: cohort pressure, daily deadlines, financial commitment, live instructors', source: 'Course Report 2024 | CIRR 2024', sourceUrl: 'https://www.coursereport.com/reports/coding-bootcamp-market-size-research-2024', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 32, type: 'outcome-bad', label: 'Dropped out of bootcamp (8-30%)', x: 650, y: -190, prob: 100, desc: '8-30% drop out depending on program quality. Top reason: pace too fast (42%), personal circumstances (35%), wrong fit (23%)', source: 'Course Report 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.coursereport.com/', sacredRoots: ['SR-010', 'SR-014'] },
      { id: 33, type: 'state', label: 'Graduated with portfolio projects', x: 850, y: -30, prob: 100, desc: 'Bootcamp grads have 2-4 portfolio projects. But "bootcamp grad" is increasingly commoditized -- 35,000+ graduate annually in the US alone', source: 'Course Report 2024 | CIRR Outcomes Report 2024', sourceUrl: 'https://cirr.org/', sacredRoots: ['SR-036', 'SR-013'] },
      { id: 34, type: 'trajectory', label: 'Job search / skill application phase', x: 1050, y: -30, prob: 100, desc: 'Average time to first job after bootcamp: 3-6 months. 72-84% report getting a job within 180 days (self-reported -- actual rates likely lower)', source: 'CIRR 2024 | Course Report 2024', sourceUrl: 'https://cirr.org/', sacredRoots: ['SR-036', 'SR-010'] },

      // YES path (deliberate practice): 40-49
      { id: 40, type: 'action', label: 'Deliberate practice: 20+ hours on real projects', x: 450, y: 200, prob: 100, desc: '20 hours of deliberate practice = functional competence (Kaufman). 10,000 hours = mastery (Ericsson, debunked as universal but valid for elite performance). Key: DELIBERATE, not passive', source: 'Josh Kaufman (The First 20 Hours) | Anders Ericsson (Peak) 2024', sourceUrl: 'https://joshkaufman.net/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 41, type: 'bottleneck', label: 'Reach 20 hours of practice?', x: 650, y: 200, prob: 40, desc: '60% quit before 20 hours. The "suck threshold" -- you must tolerate being bad at something before getting decent. Most adults cannot tolerate this', source: 'Josh Kaufman 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://joshkaufman.net/', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 42, type: 'outcome-bad', label: 'Quit during the "suck phase"', x: 650, y: 100, prob: 100, desc: 'The ego can\'t handle being a beginner. Adults especially struggle -- they\'re used to competence. "I\'m just not talented" = giving up dressed as insight', source: 'Carol Dweck (Mindset) 2024 | Learning Science 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.mindsetworks.com/', sacredRoots: ['SR-010', 'SR-005'] },
      { id: 43, type: 'state', label: 'Functionally competent -- can do basic work', x: 850, y: 200, prob: 100, desc: 'After 20-50 hours: can complete basic tasks independently. Not an expert, but capable. This is where most useful work begins', source: 'Josh Kaufman 2024 | Ericsson Research (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://joshkaufman.net/', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 44, type: 'decision', label: 'Apply the skill professionally?', x: 1050, y: 200, prob: 30, desc: 'Only 30% of new skills are applied professionally. 70% remain hobbies or are forgotten. Skill half-life: 2.5-5 years (WEF 2024) -- unused skills decay fast', source: 'World Economic Forum Future of Jobs 2024 | McKinsey Reskilling Report 2024', sourceUrl: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', sacredRoots: ['SR-036', 'SR-017'] },

      // Professional application: 45-49
      { id: 45, type: 'action', label: 'Use skill at work or freelance', x: 1250, y: 140, prob: 100, desc: 'Skills applied professionally within 6 months have 5x retention vs unused skills. Spaced repetition through work = natural learning maintenance', source: 'LinkedIn Workforce Report 2024 | McKinsey 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://economicgraph.linkedin.com/resources', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 46, type: 'bottleneck', label: 'Leads to salary increase or new income?', x: 1450, y: 140, prob: 60, desc: 'Upskilling yields 8-25% salary increase (LinkedIn 2024). Tech skills: highest ROI. Soft skills: hardest to measure but most durable. Certifications alone: diminishing returns', source: 'LinkedIn Workforce Report 2024 | Coursera Global Skills Report 2024', sourceUrl: 'https://economicgraph.linkedin.com/resources', sacredRoots: ['SR-036', 'SR-031'] },
      { id: 47, type: 'outcome-good', label: 'Career upgrade: 8-25% salary increase', x: 1700, y: 80, prob: 100, desc: 'The payoff: measurable income growth from applied skill. Those who combine skill + credential + portfolio get the biggest jumps', source: 'LinkedIn 2024 | Coursera 2024', sourceUrl: 'https://economicgraph.linkedin.com/resources', sacredRoots: ['SR-036', 'SR-031'] },
      { id: 48, type: 'outcome-bad', label: 'Skill applied but no financial return', x: 1700, y: 200, prob: 100, desc: '40% of upskilled workers see no immediate financial benefit. Market timing, saturation, and credentialism barriers. "Everyone knows Python now"', source: 'McKinsey 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-036', 'SR-013'] },

      // Unused skill decay: 50-55
      { id: 50, type: 'state', label: 'Skill learned but not applied professionally', x: 1250, y: 280, prob: 100, desc: '70% of learned skills are never used at work. The forgetting curve is relentless without use: 90% forgotten within 1 month without practice', source: 'Ebbinghaus | WEF 2024', sourceUrl: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', sacredRoots: ['SR-036', 'SR-007'] },
      { id: 51, type: 'trajectory', label: 'Skill decay: half-life 2.5-5 years', x: 1450, y: 280, prob: 100, desc: 'Technical skills decay fastest: programming language relevance shifts every 3-5 years. Soft skills (leadership, communication) last 10-20+ years. Choose wisely', source: 'WEF Future of Jobs 2024 | IBM Skills Gateway 2024', sourceUrl: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', sacredRoots: ['SR-036', 'SR-017'] },
      { id: 52, type: 'outcome-bad', label: 'Skill forgotten -- back to square one', x: 1700, y: 280, prob: 100, desc: 'The default outcome for most learners. Money spent, time invested, nothing retained. Ready to buy the next course and repeat the cycle', source: 'Ebbinghaus | Nature Human Behaviour 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nature.com/nathumbehav/', sacredRoots: ['SR-007', 'SR-031'] },

      // Mastery path convergence
      { id: 53, type: 'action', label: 'Teach the skill to others', x: 1450, y: -30, prob: 100, desc: 'The "Feynman technique": teaching forces deep understanding. Retention jumps from 10% (reading) to 90% (teaching). Teaching is the ultimate learning hack', source: 'National Training Laboratories | Edgar Dale Learning Pyramid (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://en.wikipedia.org/wiki/Learning_pyramid', sacredRoots: ['SR-036', 'SR-025'] },
      { id: 54, type: 'outcome-good', label: 'Mastery: skill becomes part of identity', x: 1700, y: -30, prob: 100, desc: 'The rare outcome: skill becomes "who you are," not "what you learned." These people never stop practicing because it\'s not effort -- it\'s expression', source: 'Cal Newport (So Good They Can\'t Ignore You) | Ericsson (Peak)', sourceUrl: 'https://calnewport.com/', sacredRoots: ['SR-005', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      // NO path (MOOC/YouTube)
      { from: 3, to: 20, label: 'no' },
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail' },
      { from: 22, to: 24, label: 'pass' },
      { from: 24, to: 25 },
      { from: 25, to: 26, label: 'fail' },
      { from: 25, to: 43, label: 'pass' },
      // PARTIAL path (bootcamp)
      { from: 3, to: 30, label: 'partial' },
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'fail' },
      { from: 31, to: 33, label: 'pass' },
      { from: 33, to: 34 },
      { from: 34, to: 44 },
      // YES path (deliberate practice)
      { from: 3, to: 40, label: 'yes' },
      { from: 40, to: 41 },
      { from: 41, to: 42, label: 'fail' },
      { from: 41, to: 43, label: 'pass' },
      { from: 43, to: 44 },
      // Professional application
      { from: 44, to: 45, label: 'yes' },
      { from: 44, to: 50, label: 'no' },
      { from: 45, to: 46 },
      { from: 46, to: 47, label: 'pass' },
      { from: 46, to: 48, label: 'fail' },
      // Skill decay
      { from: 50, to: 51 }, { from: 51, to: 52 },
      // Mastery path
      { from: 47, to: 53 }, { from: 53, to: 54 },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LEARN SKILL — Analysis (Mid)
  // ═══════════════════════════════════════════════════════════════
  learn_skillMid: {
    title: 'Learn a New Skill (Analysis)',
    input: 'I want to learn a new skill',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to learn something new', x: 0, y: 120, prob: 100, desc: '74% of workers want to learn new skills', source: 'PwC Global Workforce Survey 2024 | World Economic Forum 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.pwc.com/gx/en/issues/workforce.html', sacredRoots: ['SR-036', 'SR-007'] },
      { id: 2, type: 'action', label: 'Buy course / start learning', x: 240, y: 120, prob: 100, desc: '$400B online learning market', source: 'Statista 2025 | HolonIQ 2025', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 3, type: 'bottleneck', label: 'Complete the course', x: 480, y: 120, prob: 8, desc: '3-15% completion rate for MOOCs', source: 'MIT/Harvard MOOC Study 2025 | Class Central 2025', sourceUrl: 'https://www.edx.org/research', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Abandoned halfway', x: 480, y: 300, prob: 100, desc: 'Avg Udemy completion: 7%', source: 'Udemy Business Report 2025 | Class Central 2025', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 5, type: 'bottleneck', label: 'Practice 20+ hours', x: 720, y: 120, prob: 40, desc: '20hrs = functional competence', source: 'Josh Kaufman 2023 | Anders Ericsson Research 2023 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://joshkaufman.net/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 6, type: 'outcome-bad', label: 'Learned theory, never applied', x: 720, y: 300, prob: 100, desc: 'Retention without practice: 10% after 1mo', source: 'Ebbinghaus Forgetting Curve 2023 | Learning Science Journal 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://en.wikipedia.org/wiki/Forgetting_curve', sacredRoots: ['SR-012', 'SR-006'] },
      { id: 7, type: 'decision', label: 'Use skill professionally?', x: 960, y: 120, prob: 30, desc: 'Skill half-life: 2.5-5 years', source: 'World Economic Forum 2025 | McKinsey Reskilling Report 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-036', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Career upgrade / new income', x: 1200, y: 60, prob: 100, desc: 'Upskilling = 8-25% salary increase', source: 'LinkedIn Workforce Report 2025 | Coursera Global Skills Report 2025', sourceUrl: 'https://economicgraph.linkedin.com/resources', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 9, type: 'outcome-bad', label: 'Skill unused, forgotten', x: 1200, y: 220, prob: 100, desc: 'Forgetting curve: 70% lost in 24hrs without review', source: 'Ebbinghaus Forgetting Curve 2023 | Nature Human Behaviour 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.nature.com/nathumbehav/', sacredRoots: ['SR-006', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LEARN SKILL — Summary (Min)
  // ═══════════════════════════════════════════════════════════════
  learn_skillMin: {
    title: 'Learn a New Skill (Summary)',
    input: 'I want to learn a new skill',
    nodes: [
      { id: 1, type: 'state', label: '1000 people start learning a new skill', x: 0, y: 150, prob: 100, desc: '74% of workers want new skills. $400B online learning market. Skill half-life: 2.5-5 years', source: 'PwC 2024 | WEF 2024 | HolonIQ 2024', sourceUrl: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', sacredRoots: ['SR-036', 'SR-007'] },
      { id: 2, type: 'bottleneck', label: 'Complete the course? (3-15%)', x: 250, y: 150, prob: 8, desc: 'MOOC completion: 3-15%. Udemy avg: 7%. Bootcamps: 70-92%. Method determines outcome', source: 'MIT/Harvard MOOC Study 2024 | Class Central 2024', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 3, type: 'outcome-bad', label: '850-970 abandon the course', x: 250, y: 350, prob: 100, desc: 'Average learner has 8+ purchased courses and completes less than 1. "Course collector" syndrome', source: 'Udemy Business Report 2024 | Class Central 2024', sourceUrl: 'https://www.classcentral.com/report/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 4, type: 'bottleneck', label: 'Practice 20+ hours? (40% of completers)', x: 500, y: 150, prob: 40, desc: '20 hours = functional competence. But 60% of completers never practice -- they stay in "tutorial hell"', source: 'Josh Kaufman 2024 | Ericsson Research (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://joshkaufman.net/', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 5, type: 'outcome-bad', label: 'Learned theory, never applied -- forgotten in weeks', x: 500, y: 350, prob: 100, desc: 'Ebbinghaus: 70% forgotten in 24hrs, 90% in 1 month without practice', source: 'Ebbinghaus Forgetting Curve | Learning Science 2024', sourceUrl: 'https://en.wikipedia.org/wiki/Forgetting_curve', sacredRoots: ['SR-036', 'SR-007'] },
      { id: 6, type: 'outcome-good', label: 'Career upgrade: 8-25% salary increase', x: 750, y: 100, prob: 100, desc: 'Those who apply skills professionally within 6 months see the highest ROI. Skill + portfolio + credential = maximum impact', source: 'LinkedIn 2024 | Coursera 2024', sourceUrl: 'https://economicgraph.linkedin.com/resources', sacredRoots: ['SR-036', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Skill decays -- half-life 2.5-5 years', x: 750, y: 250, prob: 100, desc: '70% of new skills are never used at work. Technical skills decay fastest. The cycle restarts with the next course purchase', source: 'WEF 2024 | McKinsey 2024', sourceUrl: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', sacredRoots: ['SR-036', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' },
      { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'fail' },
      { from: 4, to: 6, label: 'pass' },
      { from: 4, to: 7, label: 'fail' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // YOUTUBE GURU — Full Model (30+ nodes)
  // ═══════════════════════════════════════════════════════════════
  youtube_guru: {
    title: 'YouTube Guru Course Journey',
    input: 'Someone watches a YouTube business guru video promising $10K/month',
    nodes: [
      // ── ENTRY: Discovery & Desire ──
      { id: 1, type: 'state', label: '1000 people see a guru ad promising $10K/mo', x: 0, y: 200, prob: 100, desc: 'The online education market hit $203B in 2025. Business guru videos get 500M+ views/year on YouTube. The promise is always the same: passive income, freedom, $10K/month', source: 'Statista Online Education Market 2025 | Social Blade 2025', sourceUrl: 'https://www.statista.com/outlook/emo/online-education/worldwide', sacredRoots: ['SR-013', 'SR-023'] },
      { id: 2, type: 'desire', label: 'Dream of quitting 9-5, financial freedom', x: 200, y: 200, prob: 100, desc: '67% of workers are disengaged (Gallup 2025). The guru video hits at the exact pain point — escape', source: 'Gallup State of Global Workplace 2025', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-007', 'SR-013'] },
      { id: 3, type: 'action', label: 'Enter free webinar / lead magnet funnel', x: 400, y: 200, prob: 70, desc: '60-80% click the free bait. Webinar funnels convert 2-10% to purchase. The free content is designed to sell, not teach', source: 'ClickFunnels Industry Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.clickfunnels.com/', sacredRoots: ['SR-013', 'SR-017'] },
      { id: 4, type: 'action', label: 'Buy the course ($997-$7000)', x: 600, y: 200, prob: 15, desc: 'Avg info product conversion: 1-5% cold, up to 15% from warm webinar. Upsells, countdown timers, fake scarcity push urgency', source: 'ClickFunnels / Kajabi Industry Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.clickfunnels.com/', sacredRoots: ['SR-017', 'SR-013'] },
      { id: 5, type: 'state', label: '150 of 1000 buy the course', x: 800, y: 200, prob: 100, desc: '~15% conversion from funnel viewers. Buyers feel excited — "this is the one"', source: 'ClickFunnels / Kajabi Industry Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://kajabi.com/', sacredRoots: ['SR-013', 'SR-031'] },

      // ── GATE: Engagement level ──
      { id: 6, type: 'gate', label: 'Do they actually engage with the material?', x: 1050, y: 200, prob: 15, desc: 'MOOC completion rates: 5-15% (median 12.6%). 68% never log in after week 1. Certificate-seekers: 22% vs casual: 6%', source: 'MIT/Harvard MOOC Study 2025 | Kajabi Data 2025', sourceUrl: 'https://www.edx.org/research', sacredRoots: ['SR-012', 'SR-010'] },

      // ── NO path (68%): Never started ──
      { id: 10, type: 'state', label: 'Never logged in after purchase', x: 1050, y: 480, prob: 100, desc: '68% of course buyers never log in after week 1. The dopamine hit was the purchase itself, not the learning', source: 'Kajabi Platform Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://kajabi.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 11, type: 'trajectory', label: 'Buyer remorse / rationalization', x: 1250, y: 480, prob: 100, desc: '30% of online course buyers regret at least one purchase. Many rationalize: "I will start next month"', source: 'AutomatEd / Kajabi Refund Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.automateed.com/how-to-reduce-refunds-for-online-courses', sacredRoots: ['SR-023', 'SR-013'] },
      { id: 12, type: 'decision', label: 'Request refund or keep paying?', x: 1450, y: 480, prob: 30, desc: 'Refund rates avg 5-8% of sales. Most never request — shame, denial, or already past refund window', source: 'AutomatEd Industry Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.automateed.com/how-to-reduce-refunds-for-online-courses', sacredRoots: ['SR-031', 'SR-023'] },
      { id: 13, type: 'outcome-bad', label: 'Got refund, back to square one', x: 1700, y: 400, prob: 100, desc: 'Recovered money but lost time and confidence. Will likely enter another funnel within 6 months', source: 'Digital Marketer Survey 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-023', 'SR-013'] },
      { id: 14, type: 'outcome-bad', label: 'Paid but never started — sunk cost', x: 1700, y: 560, prob: 100, desc: '$997-$7000 lost with zero action taken. Avg person repeats this 3-7 times across different gurus', source: 'Digital Marketer Survey 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-031', 'SR-023'] },

      // ── PARTIAL path (20%): Started but dropped out ──
      { id: 20, type: 'state', label: 'Started but only completed 20-40%', x: 1050, y: -40, prob: 100, desc: '~20% start but drop off between module 2 and 4. Content overload, no accountability, no quick wins', source: 'Teachfloor eLearning Statistics 2025 | Class Central 2025', sourceUrl: 'https://www.teachfloor.com/blog/elearning-statistics', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 21, type: 'trajectory', label: 'Tutorial hell: learning without doing', x: 1250, y: -40, prob: 100, desc: 'Consumption feels like progress. Watching modules gives illusion of competence without market validation', source: 'Cal Newport (Deep Work) | Industry observation (estimated by Foresight from public data)', sourceUrl: 'https://calnewport.com/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 22, type: 'bottleneck', label: 'Attempt first real-world action?', x: 1450, y: -40, prob: 25, desc: 'Only 20-30% of partial completers take any real action (send cold email, post content, launch landing page)', source: 'Industry observation (estimated by Foresight from public data)', sacredRoots: ['SR-008', 'SR-010'] },
      { id: 23, type: 'outcome-bad', label: 'Stuck in consumption mode forever', x: 1450, y: -200, prob: 100, desc: 'Buys next course, joins next webinar. Avg shiny-object buyer purchases 3-7 courses before either succeeding or giving up entirely', source: 'Digital Marketer Survey 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-023', 'SR-013'] },
      { id: 24, type: 'state', label: 'Took first action but got zero traction', x: 1700, y: -40, prob: 100, desc: 'First cold emails ignored, first content gets 12 views, first landing page gets 0 signups. Reality hits hard', source: 'Industry observation (estimated by Foresight from public data)', sacredRoots: ['SR-010', 'SR-007'] },

      // ── YES path (12%): Completed the course ──
      { id: 30, type: 'state', label: '18 of 150 buyers complete the course (12%)', x: 1250, y: 200, prob: 100, desc: 'MOOC completion avg 5-15%. These 18 have above-average discipline but course completion does not equal income', source: 'MIT/Harvard MOOC Study 2025 | Kajabi Data 2025', sourceUrl: 'https://www.edx.org/research', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 31, type: 'action', label: 'Implement the taught method (100-500 hours)', x: 1450, y: 200, prob: 100, desc: 'Real implementation requires 100-500 hours of focused work — cold outreach, content creation, product building, sales calls', source: 'Industry observation (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 32, type: 'bottleneck', label: 'Get first paying client or sale?', x: 1700, y: 200, prob: 20, desc: 'Only 3-10% of all course students ever earn back their tuition. FTC 2024 report: most income disclosures omit expenses and non-earners', source: 'FTC MLM Income Disclosure Report Sept 2024 | Industry Data 2025', sourceUrl: 'https://www.ftc.gov/business-guidance/blog/2024/09/ftc-staff-report-analyzes-70-mlm-income-disclosure-statements', sacredRoots: ['SR-010', 'SR-001'] },

      // ── FAIL from first sale bottleneck ──
      { id: 33, type: 'state', label: 'Spent $997-$7000 + 200 hours, earned $0', x: 1700, y: 80, prob: 100, desc: 'Avg course buyer spends $5K+ across courses before first dollar earned. The emotional cost compounds', source: 'FTC Consumer Protection Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.ftc.gov/business-guidance/resources', sacredRoots: ['SR-031', 'SR-023'] },
      { id: 34, type: 'decision', label: 'Blame self or blame the guru?', x: 1950, y: 80, prob: 40, desc: 'Survivorship bias: "it worked for others so I must be the problem." 60% blame themselves, 40% recognize the system', source: 'Behavioral Economics Research 2024 (estimated by Foresight from public data)', sacredRoots: ['SR-023', 'SR-009'] },
      { id: 35, type: 'outcome-bad', label: 'Buy next guru course (cycle repeats)', x: 2200, y: 20, prob: 100, desc: 'Shiny object syndrome: avg person buys 3-7 courses. The guru ecosystem is designed for repeat buyers, not repeat winners', source: 'Digital Marketer Survey 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-023', 'SR-013'] },
      { id: 36, type: 'outcome-bad', label: 'Give up on entrepreneurship entirely', x: 2200, y: 140, prob: 100, desc: 'Lost money, lost time, lost confidence. Returns to 9-5 with added debt and cynicism. Some develop distrust of all online education', source: 'Industry observation (estimated by Foresight from public data)', sacredRoots: ['SR-007', 'SR-005'] },

      // ── PASS from first sale: revenue path ──
      { id: 40, type: 'state', label: '3-4 of 150 earn back tuition', x: 1950, y: 200, prob: 100, desc: 'First revenue feels life-changing but is often $500-$2000 — barely covering the course cost', source: 'FTC Income Disclosure Analysis 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.ftc.gov/business-guidance/blog/2024/09/ftc-staff-report-analyzes-70-mlm-income-disclosure-statements', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 41, type: 'action', label: 'Scale: repeat the method, refine offer', x: 2200, y: 200, prob: 100, desc: 'Must transition from "course student" to "business operator." This requires skills the course rarely teaches: sales, hiring, systems', source: 'Industry observation (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 42, type: 'bottleneck', label: 'Sustain $3K+/mo for 6 months?', x: 2450, y: 200, prob: 25, desc: 'Most first-revenue earners plateau or regress. Sustaining requires adapting beyond the course playbook', source: 'Industry observation (estimated by Foresight from public data)', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 43, type: 'outcome-bad', label: 'Revenue dried up, back to zero', x: 2450, y: 80, prob: 100, desc: 'One-time wins do not make a business. Without systems thinking, initial traction fades', source: 'Industry observation (estimated by Foresight from public data)', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 44, type: 'decision', label: 'Reach $10K/month?', x: 2700, y: 200, prob: 10, desc: 'Less than 1% of all course buyers reach the promised income. The ones who do typically pivot significantly from the taught method', source: 'FTC Income Disclosure Analysis 2024 | Income disclosure statements (estimated by Foresight from public data)', sourceUrl: 'https://www.ftc.gov/business-guidance/blog/2024/09/ftc-staff-report-analyzes-70-mlm-income-disclosure-statements', sacredRoots: ['SR-035', 'SR-023'] },
      { id: 45, type: 'outcome-good', label: 'Built real business (pivoted from guru method)', x: 2950, y: 140, prob: 100, desc: 'The rare success story: <1 in 150 buyers. Almost always pivoted away from the original course material into something market-validated', source: 'Case studies (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-005'] },
      { id: 46, type: 'outcome-bad', label: 'Earning but not $10K — becomes a guru themselves', x: 2950, y: 280, prob: 100, desc: 'The meta-trap: the most profitable move in the guru ecosystem is to become a guru. "I made $5K/mo so now I teach others how"', source: 'FTC Earnings Claims NPRM Jan 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.ftc.gov/system/files/ftc_gov/pdf/r111003earningclaimsnprm01132025.pdf', sacredRoots: ['SR-023', 'SR-013'] },

      // ── Convergence from partial path ──
      { id: 50, type: 'outcome-bad', label: 'Total spend across gurus: $5K-$25K, net income: near $0', x: 2200, y: -40, prob: 100, desc: 'FTC 2024: income disclosures omit non-earners and expenses. When expenses are subtracted, most participants lose money', source: 'FTC MLM Income Disclosure Report Sept 2024', sourceUrl: 'https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-staff-issue-report-multi-level-marketing-income-disclosures', sacredRoots: ['SR-031', 'SR-023'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
      // Gate: NO / PARTIAL / YES
      { from: 6, to: 10, label: 'no (68%)' },
      { from: 6, to: 20, label: 'partial (20%)' },
      { from: 6, to: 30, label: 'yes (12%)' },
      // NO path
      { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 12, to: 13, label: 'yes' }, { from: 12, to: 14, label: 'no' },
      // PARTIAL path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail' }, { from: 22, to: 24, label: 'pass' },
      { from: 24, to: 50 },
      // YES path
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'fail' }, { from: 32, to: 40, label: 'pass' },
      { from: 33, to: 34 },
      { from: 34, to: 35, label: 'no' }, { from: 34, to: 36, label: 'yes' },
      // Revenue path
      { from: 40, to: 41 }, { from: 41, to: 42 },
      { from: 42, to: 43, label: 'fail' }, { from: 42, to: 44, label: 'pass' },
      { from: 44, to: 45, label: 'yes' }, { from: 44, to: 46, label: 'no' },
    ]
  },
  youtube_guruMid: {
    title: 'YouTube Guru Course Journey (Analysis)',
    input: 'Someone watches a YouTube business guru video promising $10K/month',
    nodes: [
      { id: 1, type: 'desire', label: 'Watch guru video, dream of $10K/mo', x: 0, y: 120, prob: 100, desc: 'Business guru videos get 500M+ views/year on YouTube. Online education market: $203B in 2025', source: 'Statista 2025 | Social Blade 2025 (estimated by Foresight from public data)', sourceUrl: 'https://socialblade.com/', sacredRoots: ['SR-013', 'SR-023'] },
      { id: 2, type: 'action', label: 'Buy course ($997-$7000)', x: 240, y: 120, prob: 15, desc: 'Avg info product conversion: 1-5%, upsell funnels push 15%', source: 'ClickFunnels data (estimated by Foresight from public data)', sourceUrl: 'https://www.clickfunnels.com/', sacredRoots: ['SR-017', 'SR-013'] },
      { id: 3, type: 'bottleneck', label: 'Actually complete the course', x: 480, y: 120, prob: 12, desc: 'Only 5-15% finish online courses (median 12.6%). 68% never log in after week 1', source: 'MIT/Harvard MOOC Study 2025 | Kajabi Data 2025', sourceUrl: 'https://www.edx.org/research', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Paid but never started', x: 480, y: 300, prob: 100, desc: '68% of course buyers never log in after week 1', source: 'Kajabi data (estimated by Foresight from public data)', sourceUrl: 'https://kajabi.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'action', label: 'Implement the steps', x: 720, y: 120, prob: 100, desc: 'Implementation requires 100-500 hours of real work', source: 'Industry avg (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 6, type: 'bottleneck', label: 'Get first paying client/sale', x: 960, y: 120, prob: 8, desc: 'Only 3-10% of course students earn back tuition. FTC 2024: most income disclosures omit non-earners', source: 'FTC MLM Income Disclosure Report Sept 2024', sourceUrl: 'https://www.ftc.gov/business-guidance/blog/2024/09/ftc-staff-report-analyzes-70-mlm-income-disclosure-statements', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 7, type: 'outcome-bad', label: 'Spent money, no results', x: 960, y: 300, prob: 100, desc: 'Avg course buyer spends $5K+ before first dollar earned', source: 'FTC Consumer Protection Data 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-031', 'SR-023'] },
      { id: 8, type: 'decision', label: 'Reach $10K/month?', x: 1200, y: 120, prob: 3, desc: '<1% of course buyers reach promised income levels', source: 'Income disclosure statements (estimated by Foresight from public data)', sacredRoots: ['SR-035', 'SR-023'] },
      { id: 9, type: 'outcome-good', label: 'Built real business', x: 1440, y: 60, prob: 100, desc: 'The few who succeed usually pivot from the taught method', source: 'Case studies (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-005'] },
      { id: 10, type: 'outcome-bad', label: 'Buy next guru course', x: 1440, y: 220, prob: 100, desc: 'Shiny object syndrome: avg person buys 3-7 courses', source: 'Digital Marketer survey (estimated by Foresight from public data)', sacredRoots: ['SR-023', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  youtube_guruMin: {
    title: 'YouTube Guru Course Journey (Summary)',
    input: 'Someone watches a YouTube business guru video promising $10K/month',
    nodes: [
      { id: 1, type: 'state', label: '1000 see guru ad promising $10K/mo', x: 0, y: 150, prob: 100, desc: 'Online education market: $203B. Guru videos get 500M+ views/year. ~150 of 1000 funnel viewers buy the course', source: 'Statista 2025 | Social Blade 2025', sourceUrl: 'https://www.statista.com/outlook/emo/online-education/worldwide', sacredRoots: ['SR-013', 'SR-023'] },
      { id: 2, type: 'bottleneck', label: 'Complete the course? (5-15%)', x: 250, y: 150, prob: 12, desc: 'MOOC completion: 5-15% (median 12.6%). 68% never log in after week 1', source: 'MIT/Harvard MOOC Study 2025 | Kajabi Data 2025', sourceUrl: 'https://www.edx.org/research', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 3, type: 'outcome-bad', label: '130+ paid but never finished', x: 250, y: 350, prob: 100, desc: '85-95% of buyers never complete. Avg shiny-object buyer purchases 3-7 courses', source: 'Kajabi / Digital Marketer Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://kajabi.com/', sacredRoots: ['SR-031', 'SR-023'] },
      { id: 4, type: 'bottleneck', label: 'Earn back tuition? (3-10%)', x: 500, y: 150, prob: 8, desc: 'FTC 2024: most income disclosures omit non-earners and expenses. Only 3-10% of students recoup cost', source: 'FTC MLM Income Disclosure Report Sept 2024', sourceUrl: 'https://www.ftc.gov/business-guidance/blog/2024/09/ftc-staff-report-analyzes-70-mlm-income-disclosure-statements', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 5, type: 'bottleneck', label: 'Reach $10K/mo? (<1%)', x: 750, y: 150, prob: 10, desc: 'Less than 1 in 150 buyers reaches the promised income. Those who do almost always pivot from the taught method', source: 'FTC Income Disclosure Analysis 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.ftc.gov/business-guidance/resources', sacredRoots: ['SR-035', 'SR-023'] },
      { id: 6, type: 'outcome-good', label: '<1 in 150 built a real business', x: 1000, y: 100, prob: 100, desc: 'Rare success: pivoted from course method, validated by market, built real systems', source: 'Case studies (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-005'] },
      { id: 7, type: 'outcome-bad', label: 'Rest lost $5K-$25K across gurus', x: 1000, y: 250, prob: 100, desc: 'FTC 2024: when expenses are subtracted, most participants lose money. The guru ecosystem profits from repeat buyers', source: 'FTC MLM Income Disclosure Report Sept 2024', sourceUrl: 'https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-staff-issue-report-multi-level-marketing-income-disclosures', sacredRoots: ['SR-031', 'SR-023'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (85-95%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // WANT TO WIN — Full Model (30+ nodes)
  // ═══════════════════════════════════════════════════════════════
  want_to_win: {
    title: 'I Want to Win',
    input: 'I want to win',
    nodes: [
      // ── ENTRY: Current state ──
      { id: 1, type: 'state', label: '1000 people say "I want to win"', x: 0, y: 200, prob: 100, desc: '67% of workers are disengaged (Gallup 2025), 77% experience burnout (APA 2025). The desire to "win" is universal but undefined', source: 'Gallup State of Global Workplace 2025 | APA Work & Wellbeing Survey 2025', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 2, type: 'desire', label: 'Want to win — but win what?', x: 200, y: 200, prob: 100, desc: '92% of people never define what winning looks like for them. Vague desire without clear target is the #1 trap', source: 'Harvard Business Review 2025 | Gallup 2025', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-009', 'SR-013'] },
      { id: 3, type: 'action', label: 'Attempt to define "winning"', x: 400, y: 200, prob: 100, desc: 'Writing down specific goals increases achievement likelihood by 42% (Dominican University study)', source: 'Dominican University Goal Setting Study 2023 | HBR 2025', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-009', 'SR-017'] },

      // ── GATE: Motivation source ──
      { id: 4, type: 'gate', label: 'Win for ego, for survival, or for purpose?', x: 650, y: 200, prob: 35, desc: 'Only 35% pursue goals aligned with intrinsic values (Self-Determination Theory). The rest chase status, approval, or money as end goal', source: 'Self-Determination Theory (Deci & Ryan) | Journal of Personality 2024', sourceUrl: 'https://selfdeterminationtheory.org/', sacredRoots: ['SR-009', 'SR-016'] },

      // ── NO path: Ego-driven ──
      { id: 10, type: 'trajectory', label: 'Path of ego: win to prove others wrong', x: 650, y: 460, prob: 100, desc: '"Pride goes before destruction" (Proverbs 16:18). Ego-driven winners burn relationships, health, and integrity', source: 'Proverbs 16:18 | HBR: Why Leaders Fail 2024', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-009', 'SR-026'] },
      { id: 11, type: 'action', label: 'Sacrifice everything for the trophy', x: 850, y: 460, prob: 100, desc: 'Work 80-100 hour weeks, neglect relationships, health, sleep. Short-term gains, long-term collapse', source: 'HBR: Why Leaders Fail 2024 (estimated by Foresight from public data)', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-009', 'SR-011'] },
      { id: 12, type: 'bottleneck', label: 'Do they actually win the ego game?', x: 1100, y: 460, prob: 30, desc: '70% of ego-driven pursuits end in burnout before reaching the goal. The 30% who "win" face a different crisis', source: 'APA Burnout Report 2025 | HBR 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-009', 'SR-010'] },
      { id: 13, type: 'outcome-bad', label: 'Burned out before winning', x: 1100, y: 620, prob: 100, desc: '77% of workers experience burnout. Ego-driven intensity accelerates the timeline. Body and mind quit before the goal is reached', source: 'APA Work & Wellbeing Survey 2025', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-011', 'SR-007'] },
      { id: 14, type: 'state', label: 'Won the trophy, feel empty', x: 1350, y: 400, prob: 100, desc: '73% of high-achievers report emptiness after reaching their goal. "Is this it?" — the arrival fallacy', source: 'Tal Ben-Shahar (Harvard) | APA 2025', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-013', 'SR-005'] },
      { id: 15, type: 'outcome-bad', label: 'Won the game, lost yourself', x: 1600, y: 460, prob: 100, desc: 'Health destroyed, relationships broken. 61% of executives regret sacrificed relationships', source: 'HBR 2024 | RHR International Leadership Survey 2025 (estimated by Foresight from public data)', sourceUrl: 'https://rhrinternational.com/insights/', sacredRoots: ['SR-026', 'SR-020'] },
      { id: 16, type: 'outcome-bad', label: 'Lonely at the top — no one to share it with', x: 1600, y: 340, prob: 100, desc: '61% of executives report loneliness. Power isolates; ego repels. "What does it profit a man to gain the world and lose his soul?"', source: 'Mark 8:36 | RHR International 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-026', 'SR-005'] },

      // ── PARTIAL path: Survival-driven ──
      { id: 20, type: 'trajectory', label: 'Path of survival: win because you must', x: 650, y: -20, prob: 100, desc: 'Necessity-driven motivation is powerful but fragile. Once survival is secured, motivation often collapses', source: 'Maslow Hierarchy of Needs | Self-Determination Theory 2024', sourceUrl: 'https://selfdeterminationtheory.org/', sacredRoots: ['SR-007', 'SR-009'] },
      { id: 21, type: 'action', label: 'Grind daily out of fear and necessity', x: 850, y: -20, prob: 100, desc: 'Fear is a powerful short-term motivator. Cortisol-driven performance peaks fast but crashes hard', source: 'APA Stress in America 2025 | Yerkes-Dodson Law', sourceUrl: 'https://www.apa.org/news/press/releases/stress', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 22, type: 'bottleneck', label: 'Achieve basic stability?', x: 1100, y: -20, prob: 45, desc: '45% of survival-driven workers achieve basic stability within 2-3 years. But then what?', source: 'Gallup Global Workforce Survey 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 23, type: 'outcome-bad', label: 'Survival mode forever: earning but not living', x: 1100, y: -180, prob: 100, desc: 'Stuck in survival loop. No space for growth, creativity, or meaning. Just treading water', source: 'Gallup 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 24, type: 'state', label: 'Stable but no purpose beyond money', x: 1350, y: -20, prob: 100, desc: 'Security achieved but meaning absent. Without deeper purpose, stability becomes stagnation', source: 'Self-Determination Theory (Deci & Ryan) 2024', sourceUrl: 'https://selfdeterminationtheory.org/', sacredRoots: ['SR-009', 'SR-005'] },
      { id: 25, type: 'decision', label: 'Find deeper purpose or coast?', x: 1600, y: -20, prob: 30, desc: 'Only 30% of people who achieve financial stability actively seek purpose beyond money', source: 'Gallup 2025 | Pew Research 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-009', 'SR-016'] },
      { id: 26, type: 'outcome-bad', label: 'Coasting: comfortable but unfulfilled', x: 1850, y: -100, prob: 100, desc: '"Golden handcuffs" — too comfortable to change, too unfulfilled to be happy. 67% disengagement rate', source: 'Gallup 2025', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-005', 'SR-009'] },

      // ── YES path: Purpose-driven ──
      { id: 30, type: 'action', label: 'Define your game + pay the price daily', x: 850, y: 200, prob: 100, desc: 'Deliberate practice: 10,000-hour myth debunked, but 3-5 years of focused daily effort is real. Quality over quantity', source: 'Ericsson (Peak) 2024 | Angela Duckworth (Grit) 2024', sourceUrl: 'https://angeladuckworth.com/research/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 31, type: 'bottleneck', label: 'Sustain discipline for 1+ years?', x: 1100, y: 200, prob: 18, desc: 'Only 9% achieve resolution goals yearly. Avg person gives up new habits after 7 weeks. 19% maintain changes for 2 years', source: 'European Journal of Social Psychology 2024 | StudyFinds 2025 | Gitnux Habit Statistics 2024', sourceUrl: 'https://gitnux.org/habit-statistics/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 32, type: 'outcome-bad', label: 'Quit when it got hard (the Dip)', x: 1100, y: 340, prob: 100, desc: 'The "dip" kills 82% of ambitions. Most quit right before the breakthrough. Avg habit abandoned at week 7', source: 'Seth Godin (The Dip) | StudyFinds 2025', sourceUrl: 'https://studyfinds.org/new-habits-lifestyle-changes-7-weeks/', sacredRoots: ['SR-008', 'SR-007'] },
      { id: 33, type: 'state', label: '~180 of 1000 sustained discipline past year 1', x: 1350, y: 200, prob: 100, desc: 'Grit accounted for 4% of variance in success outcomes (Duckworth). But that 4% compounds over years into massive divergence', source: 'Angela Duckworth Grit Research 2024 | West Point Study', sourceUrl: 'https://angeladuckworth.com/research/', sacredRoots: ['SR-012', 'SR-010'] },

      // ── GATE: Adaptability ──
      { id: 34, type: 'gate', label: 'Adapt strategy or stay rigid?', x: 1600, y: 200, prob: 40, desc: 'Winners pivot strategy while keeping the vision. 60% fail because they confuse tactics with identity. Growth mindset vs fixed', source: 'Carol Dweck (Mindset) | McKinsey Resilience Report 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-017', 'SR-035'] },

      // ── NO: Rigid ──
      { id: 35, type: 'outcome-bad', label: 'Stubborn: winning yesterday\'s game', x: 1600, y: 380, prob: 100, desc: 'Kodak, Blockbuster, Nokia — refused to adapt. Rigidity kills winners faster than competition. Fixed mindset = fixed ceiling', source: 'Clayton Christensen (Innovators Dilemma) | McKinsey 2025', sourceUrl: 'https://claytonchristensen.com/', sacredRoots: ['SR-009', 'SR-017'] },

      // ── PARTIAL: Winning but not yet won ──
      { id: 36, type: 'state', label: 'Winning but not yet won', x: 1600, y: 50, prob: 100, desc: 'Partial victory — progress is real but the game never ends. Sustainable winners know this. The infinite game', source: 'James Clear (Atomic Habits) | Simon Sinek (Infinite Game)', sourceUrl: 'https://jamesclear.com/', sacredRoots: ['SR-010', 'SR-031'] },

      // ── YES: Full adaptation, ready for legacy question ──
      { id: 40, type: 'action', label: 'Compound wins: systems over goals', x: 1850, y: 200, prob: 100, desc: '"You do not rise to the level of your goals. You fall to the level of your systems." Identity-based change > outcome-based', source: 'James Clear (Atomic Habits) 2024 | BJ Fogg (Stanford)', sourceUrl: 'https://jamesclear.com/', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 41, type: 'bottleneck', label: 'Build something others want?', x: 2100, y: 200, prob: 40, desc: '60% of persistent, adaptable people still build something nobody wants. Market validation separates winners from busy people', source: 'CB Insights Startup Post-Mortems 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.cbinsights.com/research/report/startup-failure-post-mortem/', sacredRoots: ['SR-035', 'SR-010'] },
      { id: 42, type: 'outcome-bad', label: 'Disciplined but building the wrong thing', x: 2100, y: 380, prob: 100, desc: 'Grit without market feedback = efficient waste. The world does not reward effort — it rewards value delivered', source: 'CB Insights 2025 | Paul Graham (Do Things That Don\'t Scale)', sacredRoots: ['SR-035', 'SR-010'] },

      // ── LEGACY DECISION ──
      { id: 43, type: 'decision', label: 'Hoard the win or serve with it?', x: 2350, y: 200, prob: 55, desc: '"Whoever wants to be great among you must be your servant." Winners who serve compound; hoarders plateau', source: 'Mark 10:43-45 | Adam Grant (Give and Take) 2024', sourceUrl: 'https://adamgrant.net/', sacredRoots: ['SR-032', 'SR-024'] },
      { id: 44, type: 'outcome-good', label: 'Win that compounds: purpose + impact + legacy', x: 2600, y: 120, prob: 100, desc: 'Givers who set boundaries are top performers in every field. "Well done, good and faithful servant" (Matthew 25:21)', source: 'Adam Grant (Give and Take) | Matthew 25:21', sourceUrl: 'https://adamgrant.net/', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 45, type: 'outcome-bad', label: 'Won once, hoarded, declined', x: 2600, y: 300, prob: 100, desc: '"Whoever has will be given more; whoever does not have, even what they have will be taken." Hoarding kills compounding', source: 'Matthew 25:29 | Nassim Taleb (Antifragile)', sourceUrl: 'https://www.fooledbyrandomness.com/', sacredRoots: ['SR-013', 'SR-009'] },

      // ── Convergence from partial paths ──
      { id: 50, type: 'decision', label: 'Find purpose to keep going?', x: 1850, y: 50, prob: 40, desc: 'Those in the "winning but not won" state must find deeper meaning or risk stagnation', source: 'Self-Determination Theory 2024 | Simon Sinek (Start with Why)', sourceUrl: 'https://selfdeterminationtheory.org/', sacredRoots: ['SR-009', 'SR-016'] },
      { id: 51, type: 'outcome-bad', label: 'Plateau: good enough but not great', x: 2100, y: -20, prob: 100, desc: 'Settled for "good enough." No urgency, no growth. Comfortable mediocrity that slowly erodes confidence', source: 'Gallup 2025 | Jim Collins (Good to Great)', sacredRoots: ['SR-005', 'SR-010'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      // Gate: NO (ego) / PARTIAL (survival) / YES (purpose)
      { from: 4, to: 10, label: 'no (ego)' },
      { from: 4, to: 20, label: 'partial (survival)' },
      { from: 4, to: 30, label: 'yes (purpose)' },
      // EGO path
      { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 12, to: 13, label: 'fail' }, { from: 12, to: 14, label: 'pass' },
      { from: 14, to: 15 }, { from: 14, to: 16 },
      // SURVIVAL path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail' }, { from: 22, to: 24, label: 'pass' },
      { from: 24, to: 25 },
      { from: 25, to: 26, label: 'no' }, { from: 25, to: 40, label: 'yes' },
      // PURPOSE path
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'fail' }, { from: 31, to: 33, label: 'pass' },
      { from: 33, to: 34 },
      { from: 34, to: 35, label: 'no' }, { from: 34, to: 36, label: 'partial' }, { from: 34, to: 40, label: 'yes' },
      // Partial convergence
      { from: 36, to: 50 },
      { from: 50, to: 51, label: 'no' }, { from: 50, to: 40, label: 'yes' },
      // Purpose-driven continuation
      { from: 40, to: 41 },
      { from: 41, to: 42, label: 'fail' }, { from: 41, to: 43, label: 'pass' },
      { from: 43, to: 44, label: 'yes' }, { from: 43, to: 45, label: 'no' },
    ]
  },
  want_to_winMid: {
    title: 'I Want to Win (Analysis)',
    input: 'I want to win',
    nodes: [
      { id: 1, type: 'state', label: 'Current position: not winning yet', x: 0, y: 160, prob: 100, desc: '67% of workers are disengaged, 77% experience burnout', source: 'Gallup State of Global Workplace 2025 | APA Work & Wellbeing Survey 2025', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 2, type: 'desire', label: 'Want to win — but win what?', x: 260, y: 160, prob: 100, desc: '92% of people never define what winning looks like for them', source: 'Harvard Business Review 2025 | Gallup 2025', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-009', 'SR-013'] },
      { id: 3, type: 'decision', label: 'Win for ego or win for purpose?', x: 520, y: 160, prob: 35, desc: 'Only 35% pursue goals aligned with intrinsic values', source: 'Self-Determination Theory (Deci & Ryan) | Journal of Personality 2024', sourceUrl: 'https://selfdeterminationtheory.org/', sacredRoots: ['SR-009', 'SR-016'] },
      { id: 4, type: 'trajectory', label: 'Path of ego: win to prove others wrong', x: 520, y: 360, prob: 100, desc: '"Pride goes before destruction." Ego-driven winners burn relationships, health, and integrity', source: 'Proverbs 16:18 | HBR: Why Leaders Fail 2024', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-009', 'SR-026'] },
      { id: 5, type: 'outcome-bad', label: 'Won the game, lost yourself', x: 780, y: 440, prob: 100, desc: '73% of high-achievers report emptiness after reaching their goal', source: 'Tal Ben-Shahar (Harvard) | APA 2025', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-013', 'SR-005'] },
      { id: 6, type: 'outcome-bad', label: 'Burned everyone on the way up', x: 780, y: 300, prob: 100, desc: '61% of executives report regret over sacrificed relationships', source: 'HBR 2024 | RHR International Leadership Survey 2025 (estimated by Foresight from public data)', sourceUrl: 'https://rhrinternational.com/insights/', sacredRoots: ['SR-026', 'SR-020'] },
      { id: 7, type: 'action', label: 'Define your game + pay the price daily', x: 780, y: 160, prob: 100, desc: 'Deliberate practice: 3-5 years of focused daily effort. Quality over quantity', source: 'Ericsson (Peak) 2024 | Cal Newport (Deep Work)', sourceUrl: 'https://calnewport.com/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 8, type: 'bottleneck', label: 'Can you sustain discipline for years?', x: 1040, y: 160, prob: 18, desc: 'Only 9% achieve resolution goals yearly. 19% maintain changes for 2 years', source: 'European Journal of Social Psychology 2024 | Gitnux Habit Statistics 2024', sourceUrl: 'https://gitnux.org/habit-statistics/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 9, type: 'outcome-bad', label: 'Quit when it got hard', x: 1040, y: 360, prob: 100, desc: 'The "dip" kills 82% of ambitions. Avg habit abandoned at week 7', source: 'Seth Godin (The Dip) | StudyFinds 2025', sourceUrl: 'https://studyfinds.org/new-habits-lifestyle-changes-7-weeks/', sacredRoots: ['SR-008', 'SR-007'] },
      { id: 10, type: 'gate', label: 'Do you adapt or stay rigid?', x: 1300, y: 160, prob: 40, desc: 'Winners pivot strategy while keeping the vision. Growth mindset vs fixed mindset', source: 'Carol Dweck (Mindset) | McKinsey Resilience Report 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 11, type: 'outcome-bad', label: 'Stubborn: winning yesterday\'s game', x: 1300, y: 360, prob: 100, desc: 'Kodak, Blockbuster, Nokia — refused to adapt. Rigidity kills faster than competition', source: 'Clayton Christensen (Innovators Dilemma) | McKinsey 2025', sourceUrl: 'https://claytonchristensen.com/', sacredRoots: ['SR-009', 'SR-017'] },
      { id: 12, type: 'state', label: 'Winning but not yet won', x: 1300, y: 60, prob: 100, desc: 'Partial victory — progress is real but the game never ends', source: 'James Clear (Atomic Habits) | Simon Sinek (Infinite Game)', sourceUrl: 'https://jamesclear.com/', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 13, type: 'decision', label: 'Hoard the win or serve with it?', x: 1560, y: 160, prob: 55, desc: '"Whoever wants to be great among you must be your servant." Givers who set boundaries are top performers', source: 'Mark 10:43-45 | Adam Grant (Give and Take) 2024', sourceUrl: 'https://adamgrant.net/', sacredRoots: ['SR-032', 'SR-024'] },
      { id: 14, type: 'outcome-good', label: 'Win that compounds: purpose + impact', x: 1820, y: 80, prob: 100, desc: 'Givers who set boundaries are the top performers in every field', source: 'Adam Grant (Give and Take) | Matthew 25:21', sourceUrl: 'https://adamgrant.net/', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 15, type: 'outcome-bad', label: 'Won once, never again — hoarding kills growth', x: 1820, y: 280, prob: 100, desc: '"Whoever has will be given more; whoever does not have, even what they have will be taken"', source: 'Matthew 25:29 | Nassim Taleb (Antifragile)', sourceUrl: 'https://www.fooledbyrandomness.com/', sacredRoots: ['SR-013', 'SR-009'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'no' }, { from: 3, to: 7, label: 'yes' },
      { from: 4, to: 5 }, { from: 4, to: 6 },
      { from: 7, to: 8 },
      { from: 8, to: 9, label: 'fail' }, { from: 8, to: 10, label: 'pass' },
      { from: 10, to: 11, label: 'no' }, { from: 10, to: 12, label: 'partial' }, { from: 10, to: 13, label: 'yes' },
      { from: 12, to: 13 },
      { from: 13, to: 14, label: 'yes' }, { from: 13, to: 15, label: 'no' },
    ]
  },
  want_to_winMin: {
    title: 'I Want to Win (Summary)',
    input: 'I want to win',
    nodes: [
      { id: 1, type: 'state', label: '1000 people say "I want to win"', x: 0, y: 150, prob: 100, desc: '67% disengaged, 77% burnout. The desire is universal, the definition is not', source: 'Gallup 2025 | APA 2025', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 2, type: 'decision', label: 'Ego or purpose?', x: 250, y: 150, prob: 35, desc: 'Only 35% pursue goals aligned with intrinsic values. The rest chase external validation', source: 'Self-Determination Theory (Deci & Ryan) 2024', sourceUrl: 'https://selfdeterminationtheory.org/', sacredRoots: ['SR-009', 'SR-016'] },
      { id: 3, type: 'outcome-bad', label: '650 chase ego — burn out or feel empty', x: 250, y: 350, prob: 100, desc: '73% of high-achievers report emptiness. 61% of executives regret sacrificed relationships', source: 'Tal Ben-Shahar (Harvard) | HBR 2024 | APA 2025', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-013', 'SR-026'] },
      { id: 4, type: 'bottleneck', label: 'Sustain discipline 1+ year? (9-19%)', x: 500, y: 150, prob: 18, desc: 'Only 9% achieve resolution goals yearly. Avg habit abandoned at week 7. 19% maintain for 2 years', source: 'Gitnux Habit Statistics 2024 | StudyFinds 2025', sourceUrl: 'https://gitnux.org/habit-statistics/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 5, type: 'bottleneck', label: 'Adapt + build something others want?', x: 750, y: 150, prob: 40, desc: 'Growth mindset + market validation. 60% fail by confusing tactics with identity', source: 'Carol Dweck (Mindset) | McKinsey 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 6, type: 'outcome-good', label: 'Win that compounds: purpose + impact', x: 1000, y: 100, prob: 100, desc: 'Givers with boundaries are top performers. Serve, compound, leave a legacy', source: 'Adam Grant (Give and Take) | Matthew 25:21', sourceUrl: 'https://adamgrant.net/', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 7, type: 'outcome-bad', label: 'Most quit, plateau, or hoard', x: 1000, y: 250, prob: 100, desc: '82% quit in the Dip. Those who hoard decline. The infinite game rewards service, not accumulation', source: 'Seth Godin (The Dip) | Matthew 25:29 | Simon Sinek (Infinite Game)', sacredRoots: ['SR-008', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'no (65%)' }, { from: 2, to: 4, label: 'yes (35%)' },
      { from: 4, to: 3, label: 'fail (82%)' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  // ============================================================
  // CAREER CHANGE AFTER 30
  // ============================================================
  career_changeMin: {
    title: 'Change Career After 30 (Summary)',
    input: 'Someone over 30 wants to completely change their career path',
    nodes: [
      { id: 1, type: 'state', label: 'Unhappy in current career after 30', x: 0, y: 150, prob: 100, desc: '50% of US workers considered a career change in 2025; dissatisfaction peaks in mid-30s', source: 'Apollo Technical 2026 | Careershifters 2025', sourceUrl: 'https://www.apollotechnical.com/career-change-statistics/', sacredRoots: ['SR-007', 'SR-016'] },
      { id: 2, type: 'bottleneck', label: 'Actually start reskilling? (35%)', x: 300, y: 150, prob: 35, desc: 'Only 35% of those considering a change take concrete action', source: 'Work Insiders 2026 | PwC Global Workforce Survey 2024', sourceUrl: 'https://workinsiders.com/statistics-on-career-change-success-rates-by-age/', sacredRoots: ['SR-001', 'SR-008'] },
      { id: 3, type: 'outcome-bad', label: 'Stayed in old career -- too risky', x: 300, y: 350, prob: 100, desc: '65% never act -- fear of income loss keeps them stuck', source: 'Careershifters 2025', sourceUrl: 'https://www.careershifters.org/career-change-statistics', sacredRoots: ['SR-007', 'SR-009'] },
      { id: 4, type: 'bottleneck', label: 'Complete reskilling? (72%)', x: 600, y: 150, prob: 72, desc: '72% of bootcamp grads find jobs in field within 6 months', source: 'Course Report 2025 | CIRR 2025', sourceUrl: 'https://www.educate-me.co/blog/bootcamp-market-statistics', sacredRoots: ['SR-008', 'SR-036'] },
      { id: 5, type: 'bottleneck', label: 'Land a job in new field? (60%)', x: 900, y: 150, prob: 60, desc: '60% of career changers who complete reskilling land a role within 12 months', source: 'BLS 2025 | CIRR 2025', sourceUrl: 'https://www.bls.gov/careeroutlook/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 6, type: 'outcome-good', label: 'Successful career change', x: 1200, y: 100, prob: 100, desc: '82% of career changers over 30 report satisfaction; avg salary increase 13.9%', source: 'Work Insiders 2026 | BambooHR 2025', sourceUrl: 'https://workinsiders.com/statistics-on-career-change-success-rates-by-age/', sacredRoots: ['SR-005', 'SR-016'] },
      { id: 7, type: 'outcome-bad', label: 'Failed transition -- back to old field', x: 1200, y: 250, prob: 100, desc: 'Ran out of savings or could not compete with younger candidates', source: 'AARP 2025 | Careershifters 2025', sourceUrl: 'https://www.careershifters.org/career-change-statistics', sacredRoots: ['SR-031', 'SR-010'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  career_changeMid: {
    title: 'Change Career After 30 (Analysis)',
    input: 'Someone over 30 wants to completely change their career path',
    nodes: [
      { id: 1, type: 'state', label: 'Unhappy in current career after 30', x: 0, y: 140, prob: 100, desc: '50% of US workers considered a career change in 2025', source: 'Apollo Technical 2026 | Careershifters 2025', sourceUrl: 'https://www.apollotechnical.com/career-change-statistics/', sacredRoots: ['SR-007', 'SR-016'] },
      { id: 2, type: 'desire', label: 'Want a completely different career', x: 240, y: 140, prob: 100, desc: '39% for higher salary; 33% for work-life balance', source: 'High5 Test 2025 | Work Insiders 2026', sourceUrl: 'https://high5test.com/career-change-statistics/', sacredRoots: ['SR-016', 'SR-031'] },
      { id: 3, type: 'decision', label: 'Have 6+ months savings?', x: 480, y: 140, prob: 40, desc: 'Financial advisors recommend 6-12 months runway; only 40% have adequate savings', source: 'CFP Board 2025 | Federal Reserve SHED 2024', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 4, type: 'action', label: 'Enroll in reskilling program', x: 720, y: 140, prob: 100, desc: 'Bootcamps $7K-20K, online certs $200-5K; 50% of workers need reskilling by 2025', source: 'Course Report 2025 | World Economic Forum 2025', sacredRoots: ['SR-036', 'SR-008'] },
      { id: 5, type: 'bottleneck', label: 'Complete the program?', x: 960, y: 140, prob: 65, desc: 'Bootcamp completion 65-85%; online courses only 15-40%', source: 'Course Report 2025 | DigitalDefynd 2025', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 6, type: 'gate', label: 'Overcome age bias in hiring?', x: 1200, y: 140, prob: 55, desc: 'Callback rates drop 30-50% after 40; 16,223 age discrimination charges in 2024', source: 'SHRM 2025 | EEOC 2024', sourceUrl: 'https://www.shrm.org/', sacredRoots: ['SR-010', 'SR-005'] },
      { id: 7, type: 'bottleneck', label: 'Survive the salary dip?', x: 1440, y: 140, prob: 60, desc: 'Most take 10-20% initial pay cut; recovery 1-3 years', source: 'BambooHR 2025 | Payscale 2025', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 8, type: 'outcome-good', label: 'Thriving in new career', x: 1680, y: 80, prob: 100, desc: '82% report higher satisfaction; avg 7.4% wage growth after stabilization', source: 'Work Insiders 2026 | OECD 2024', sacredRoots: ['SR-005', 'SR-016'] },
      { id: 9, type: 'outcome-bad', label: 'Burned savings, back to old career', x: 1680, y: 250, prob: 100, desc: 'Avg unemployment 23 weeks; without runway, forced to return', source: 'BLS 2025', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 20, type: 'action', label: 'Reskill while working full-time', x: 480, y: 320, prob: 100, desc: 'Nights/weekends; takes 2-3x longer but preserves income', source: 'Harvard Extension 2025', sacredRoots: ['SR-008', 'SR-014'] },
      { id: 21, type: 'bottleneck', label: 'Avoid burnout?', x: 720, y: 320, prob: 45, desc: '62% report impostor syndrome; burnout spikes when combining work + study', source: 'PMC Meta-Analysis 2025', sacredRoots: ['SR-014', 'SR-011'] },
      { id: 22, type: 'outcome-bad', label: 'Burnout -- quit reskilling', x: 720, y: 480, prob: 100, desc: 'Full-time work + study collapsed; back to status quo', source: 'WHO Burnout Report 2024', sacredRoots: ['SR-014', 'SR-007'] },
      { id: 30, type: 'state', label: 'Rejected repeatedly -- age bias', x: 1200, y: 350, prob: 100, desc: 'Older applicants get 30-50% fewer callbacks', source: 'UC Press Meta-Analysis 2023', sacredRoots: ['SR-010', 'SR-005'] },
      { id: 31, type: 'outcome-bad', label: 'Gave up -- age discrimination won', x: 1440, y: 350, prob: 100, desc: 'Age discrimination costs US economy $850B/year', source: 'AARP 2025 | EEOC 2024', sacredRoots: ['SR-010', 'SR-009'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 20, label: 'no' }, { from: 3, to: 4, label: 'yes' },
      { from: 20, to: 21 }, { from: 21, to: 4, label: 'pass' }, { from: 21, to: 22, label: 'fail' },
      { from: 4, to: 5 },
      { from: 5, to: 30, label: 'fail' }, { from: 5, to: 6, label: 'pass' },
      { from: 6, to: 30, label: 'no' }, { from: 6, to: 7, label: 'yes' },
      { from: 30, to: 31 },
      { from: 7, to: 9, label: 'fail' }, { from: 7, to: 8, label: 'pass' },
    ]
  },
  career_change: {
    title: 'Change Career After 30',
    input: 'Someone over 30 wants to completely change their career path',
    nodes: [
      { id: 1, type: 'state', label: 'Stuck in unfulfilling career after 30', x: 0, y: 200, prob: 100, desc: '50% of US workers considered a career change in 2025; avg person changes 5-7 times in lifetime', source: 'Apollo Technical 2026 | Careershifters 2025', sourceUrl: 'https://www.apollotechnical.com/career-change-statistics/', sacredRoots: ['SR-007', 'SR-016'] },
      { id: 2, type: 'desire', label: 'Want a completely different career', x: 200, y: 200, prob: 100, desc: '39% for higher salary; 33% for work-life balance; 27% for passion/purpose', source: 'High5 Test 2025 | Work Insiders 2026', sacredRoots: ['SR-016', 'SR-005'] },
      { id: 3, type: 'action', label: 'Research new career options', x: 400, y: 200, prob: 100, desc: '32% of people 25-44 actively research career changes each year', source: 'Apollo Technical 2026', sacredRoots: ['SR-036', 'SR-017'] },
      { id: 4, type: 'bottleneck', label: 'Actually commit to the change?', x: 600, y: 200, prob: 35, desc: 'Only 35% take concrete action -- rest stay in research mode', source: 'Work Insiders 2026 | Careershifters 2025', sacredRoots: ['SR-001', 'SR-008'] },
      { id: 5, type: 'gate', label: 'Financial runway situation', x: 850, y: 200, prob: 40, desc: 'Experts recommend 6-12 months savings; only 40% have adequate funds', source: 'CFP Board 2025 | Federal Reserve SHED 2024', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 6, type: 'action', label: 'Enroll in reskilling program', x: 1100, y: 200, prob: 100, desc: 'Bootcamps $7K-20K (avg 14 weeks); online certs $200-5K; university $10K-50K', source: 'Course Report 2025 | DigitalDefynd 2025', sacredRoots: ['SR-036', 'SR-008'] },
      { id: 7, type: 'bottleneck', label: 'Complete the reskilling program?', x: 1300, y: 200, prob: 65, desc: 'Bootcamp completion 65-85%; paid online courses only 15-40%; free MOOCs 5-15%', source: 'Course Report 2025', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 8, type: 'action', label: 'Build portfolio and network in new field', x: 1550, y: 200, prob: 100, desc: 'Networking accounts for 70-85% of jobs filled', source: 'LinkedIn Workforce Report 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-025', 'SR-012'] },
      { id: 9, type: 'gate', label: 'Overcome age bias in hiring?', x: 1800, y: 200, prob: 55, desc: 'Age discrimination charges: 16,223 in 2024; callback rates drop 30-50% for older applicants', source: 'EEOC 2024 | UC Press Meta-Analysis 2023', sourceUrl: 'https://www.shrm.org/', sacredRoots: ['SR-010', 'SR-005'] },
      { id: 10, type: 'action', label: 'Start new role at entry/mid level', x: 2050, y: 200, prob: 100, desc: 'Most accept 1-2 level downgrade; avg salary dip 10-20% in year 1', source: 'BambooHR 2025 | Payscale 2025', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 11, type: 'bottleneck', label: 'Survive impostor syndrome?', x: 2250, y: 200, prob: 62, desc: '62% prevalence globally; career changers especially vulnerable', source: 'PMC Impostor Syndrome Meta-Analysis 2025', sacredRoots: ['SR-009', 'SR-005'] },
      { id: 12, type: 'bottleneck', label: 'Recover salary within 3 years?', x: 2500, y: 200, prob: 55, desc: 'Voluntary changers age 45-54 see 7.4% avg wage growth; full recovery 1-3 years', source: 'OECD Employment Outlook 2024', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 13, type: 'decision', label: 'Relationship survives the transition?', x: 2750, y: 200, prob: 54, desc: 'Nearly half of divorcees cite career choices as major marriage conflict', source: 'Forbes Advisor 2023 | APA 2025', sacredRoots: ['SR-026', 'SR-031'] },
      { id: 14, type: 'outcome-good', label: 'Thriving in new career -- higher satisfaction', x: 3000, y: 120, prob: 100, desc: '82% report success and satisfaction; avg 7.4% wage growth after stabilization', source: 'Work Insiders 2026 | OECD 2024', sacredRoots: ['SR-005', 'SR-016'] },
      { id: 15, type: 'outcome-good', label: 'New career + income exceeds old career', x: 3000, y: 0, prob: 100, desc: 'Top performers exceed pre-change salary within 2 years; avg increase 13.9%', source: 'BambooHR 2025', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 20, type: 'state', label: 'Analysis paralysis -- endless research', x: 600, y: 400, prob: 100, desc: '65% never take the first step; fear of income loss is the top blocker', source: 'Careershifters 2025', sacredRoots: ['SR-007', 'SR-001'] },
      { id: 21, type: 'outcome-bad', label: 'Stayed in old career -- regret compounds', x: 850, y: 400, prob: 100, desc: 'Top 5 regrets: "I wish I had the courage to live true to myself"', source: 'Careershifters 2025', sacredRoots: ['SR-007', 'SR-009'] },
      { id: 22, type: 'state', label: 'No savings -- cannot stop working', x: 850, y: 420, prob: 100, desc: '60% of Americans live paycheck to paycheck', source: 'Federal Reserve SHED 2024', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 23, type: 'action', label: 'Reskill nights and weekends', x: 1100, y: 420, prob: 100, desc: 'Extend timeline 2-3x but maintain income', source: 'Harvard Extension 2025', sacredRoots: ['SR-008', 'SR-014'] },
      { id: 24, type: 'bottleneck', label: 'Avoid burnout doing both?', x: 1300, y: 420, prob: 45, desc: '55% burn out trying full-time work + reskilling; takes 12-24 months', source: 'WHO Burnout Report 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-014', 'SR-011'] },
      { id: 25, type: 'state', label: 'Some savings but not enough', x: 850, y: 310, prob: 100, desc: '3-4 months runway -- enough to start but not if it takes longer', source: 'CFP Board 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 26, type: 'action', label: 'Freelance/part-time while transitioning', x: 1100, y: 310, prob: 100, desc: '36% of US workforce freelances (Upwork 2024)', source: 'Upwork Freelance Forward 2024', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 27, type: 'bottleneck', label: 'Freelance covers expenses?', x: 1300, y: 310, prob: 50, desc: '50% earn enough to cover basics in first 6 months', source: 'Upwork 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 28, type: 'outcome-bad', label: 'Burnout -- quit reskilling', x: 1550, y: 420, prob: 100, desc: 'Exhaustion from double workload; gave up within 6-12 months', source: 'WHO Burnout Report 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-014', 'SR-007'] },
      { id: 29, type: 'outcome-bad', label: 'Freelance income too low -- forced back', x: 1550, y: 340, prob: 100, desc: 'Cannot sustain reskilling costs + living expenses on part-time income', source: 'Upwork 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 30, type: 'state', label: 'Dropped out of reskilling program', x: 1300, y: 480, prob: 100, desc: 'Only 15-40% complete paid online courses', source: 'Learning Revolution 2025', sacredRoots: ['SR-008', 'SR-010'] },
      { id: 31, type: 'decision', label: 'Try a different program?', x: 1550, y: 480, prob: 30, desc: '30% try a second program after failing the first', source: 'Course Report 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-001', 'SR-036'] },
      { id: 32, type: 'outcome-bad', label: 'Gave up on reskilling entirely', x: 1800, y: 520, prob: 100, desc: 'Sunk cost of $5K-20K in courses never completed', source: 'Course Report 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 33, type: 'state', label: 'Rejected repeatedly -- age bias', x: 1800, y: 420, prob: 100, desc: 'Applicants over 40 get 30-50% fewer callbacks', source: 'UC Press Meta-Analysis 2023 | AARP 2025', sacredRoots: ['SR-010', 'SR-005'] },
      { id: 34, type: 'decision', label: 'Pivot to self-employment?', x: 2050, y: 420, prob: 35, desc: '35% blocked by age bias pivot to freelancing/self-employment', source: 'AARP 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-001', 'SR-012'] },
      { id: 35, type: 'outcome-bad', label: 'Age discrimination won -- gave up', x: 2250, y: 460, prob: 100, desc: 'Age discrimination costs US economy $850B/year', source: 'AARP 2025 | EEOC 2024', sacredRoots: ['SR-010', 'SR-009'] },
      { id: 36, type: 'state', label: 'Hired but significantly underpaid', x: 1800, y: 310, prob: 100, desc: 'Accepted 20-30% below market to get foot in door', source: 'Payscale 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-013'] },
      { id: 37, type: 'bottleneck', label: 'Close the pay gap within 2 years?', x: 2050, y: 310, prob: 45, desc: '45% reach market rate within 2 years', source: 'BambooHR 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 38, type: 'state', label: 'Impostor syndrome -- feel like a fraud', x: 2250, y: 380, prob: 100, desc: '62% global prevalence; heightened for career changers', source: 'PMC Impostor Syndrome Meta-Analysis 2025', sacredRoots: ['SR-009', 'SR-013'] },
      { id: 39, type: 'decision', label: 'Push through or quit?', x: 2500, y: 380, prob: 40, desc: '40% push through with mentorship; 60% retreat to comfort zone', source: 'Springer Nature 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-001', 'SR-025'] },
      { id: 40, type: 'outcome-bad', label: 'Permanent salary cut -- never recovered', x: 2500, y: 310, prob: 100, desc: 'Some never close the gap and earn less for rest of career', source: 'BLS 2024 | Payscale 2025', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 41, type: 'outcome-bad', label: 'Quit new career -- back to old field', x: 2750, y: 380, prob: 100, desc: 'Lost 1-3 years and $10K-50K in reskilling costs', source: 'Careershifters 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-009', 'SR-007'] },
      { id: 42, type: 'state', label: 'Career change destroyed relationship', x: 2750, y: 320, prob: 100, desc: 'Nearly half of divorcees cite career choices as major conflict', source: 'Forbes Advisor 2023 | APA 2025', sacredRoots: ['SR-026', 'SR-031'] },
      { id: 43, type: 'outcome-bad', label: 'New career but lost family', x: 3000, y: 320, prob: 100, desc: 'Won the career, lost what mattered', source: 'APA 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-026', 'SR-005'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 20, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 20, to: 21 },
      { from: 5, to: 22, label: 'no' }, { from: 5, to: 25, label: 'partial' }, { from: 5, to: 6, label: 'yes' },
      { from: 22, to: 23 }, { from: 23, to: 24 },
      { from: 24, to: 6, label: 'pass' }, { from: 24, to: 28, label: 'fail' },
      { from: 25, to: 26 }, { from: 26, to: 27 },
      { from: 27, to: 6, label: 'pass' }, { from: 27, to: 29, label: 'fail' },
      { from: 6, to: 7 },
      { from: 7, to: 30, label: 'fail' }, { from: 7, to: 8, label: 'pass' },
      { from: 30, to: 31 }, { from: 31, to: 6, label: 'yes' }, { from: 31, to: 32, label: 'no' },
      { from: 8, to: 9 },
      { from: 9, to: 33, label: 'no' }, { from: 9, to: 36, label: 'partial' }, { from: 9, to: 10, label: 'yes' },
      { from: 33, to: 34 }, { from: 34, to: 26, label: 'yes' }, { from: 34, to: 35, label: 'no' },
      { from: 36, to: 37 }, { from: 37, to: 11, label: 'pass' }, { from: 37, to: 40, label: 'fail' },
      { from: 10, to: 11 },
      { from: 11, to: 38, label: 'fail' }, { from: 11, to: 12, label: 'pass' },
      { from: 38, to: 39 }, { from: 39, to: 12, label: 'yes' }, { from: 39, to: 41, label: 'no' },
      { from: 12, to: 40, label: 'fail' }, { from: 12, to: 13, label: 'pass' },
      { from: 13, to: 42, label: 'no' }, { from: 13, to: 14, label: 'yes' },
      { from: 42, to: 43 },
      { from: 14, to: 15 },
    ]
  },
  // ============================================================
  // BUY A HOUSE
  // ============================================================
  buy_houseMin: {
    title: 'Buy a House (Summary)',
    input: 'Someone wants to buy their first house',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to buy first home', x: 0, y: 150, prob: 100, desc: 'First-time buyers: record low 24% of purchases (2024). Median age 38', source: 'NAR Profile of Home Buyers and Sellers 2024', sourceUrl: 'https://www.nar.realtor/', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 2, type: 'bottleneck', label: 'Save down payment? (52%)', x: 300, y: 150, prob: 52, desc: '48% never save enough. Median down payment 9%. Total cash needed: $50K-$65K', source: 'NAR 2024 | NerdWallet 2025', sacredRoots: ['SR-008', 'SR-031'] },
      { id: 3, type: 'outcome-bad', label: 'Priced out of market', x: 300, y: 350, prob: 100, desc: 'Cannot accumulate down payment + closing costs', source: 'NAR 2025', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 4, type: 'bottleneck', label: 'Mortgage approved? (81%)', x: 600, y: 150, prob: 81, desc: 'Approval rate 81%. Top denial: DTI ratio (36%), credit (23%)', source: 'Homebuyer.com HMDA 2025', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 5, type: 'bottleneck', label: 'Find home + close? (85%)', x: 900, y: 150, prob: 85, desc: '15% of deals fall through. Inspection issues #1 cause', source: 'Redfin 2025', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 6, type: 'outcome-good', label: 'Homeowner -- building equity', x: 1200, y: 80, prob: 100, desc: 'Homeowner net worth 40x renter ($396K vs $10K)', source: 'Federal Reserve SCF 2023', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 7, type: 'outcome-bad', label: 'House poor or deal failed', x: 1200, y: 250, prob: 100, desc: '73% have regrets. Hidden costs $16K/year', source: 'Clever Real Estate 2024 | Zillow 2025', sacredRoots: ['SR-031', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 7, label: 'fail' }, { from: 5, to: 6, label: 'pass' },
    ]
  },
  buy_houseMid: {
    title: 'Buy a House (Analysis)',
    input: 'Someone wants to buy their first house',
    nodes: [
      { id: 1, type: 'state', label: 'Want to buy first home', x: 0, y: 150, prob: 100, desc: 'First-time buyers: 24% of purchases in 2024 (record low). Median age: 38', source: 'NAR Profile 2024', sourceUrl: 'https://www.nar.realtor/', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 2, type: 'bottleneck', label: 'Save down payment + closing costs?', x: 250, y: 150, prob: 52, desc: '48% never save enough. Total cash needed: $50K-$65K on median $425K home', source: 'NAR 2024 | NerdWallet 2025', sacredRoots: ['SR-008', 'SR-031'] },
      { id: 3, type: 'outcome-bad', label: 'Cannot save -- priced out', x: 250, y: 350, prob: 100, desc: 'Student debt, rising rents eat savings. Buyer age keeps climbing', source: 'NAR 2025 | Federal Reserve SCF 2023', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 4, type: 'gate', label: 'Mortgage approved?', x: 500, y: 150, prob: 81, desc: 'Approval 81%. Denial: DTI too high (36%), bad credit (23%), insufficient cash (12%)', source: 'Homebuyer.com HMDA 2025 | NerdWallet 2024', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 5, type: 'outcome-bad', label: 'Denied -- DTI or credit issues', x: 500, y: 380, prob: 100, desc: 'Denial rate doubled since 2019', source: 'NerdWallet 2024', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 10, type: 'state', label: 'Conditional approval -- needs more docs', x: 500, y: 270, prob: 100, desc: 'Lender wants additional documentation or lower debt', source: 'ICE Mortgage Technology 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 11, type: 'bottleneck', label: 'Meet conditions? (65%)', x: 750, y: 270, prob: 65, desc: '65% of conditionally approved get full approval', source: 'ICE Mortgage Technology 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-008', 'SR-031'] },
      { id: 6, type: 'bottleneck', label: 'Find affordable home + win bid?', x: 750, y: 150, prob: 65, desc: '35% priced out. 20% of homes get multiple offers. Avg search: 2-5 months', source: 'NAR 2024 | Redfin 2025', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 7, type: 'bottleneck', label: 'Pass inspection + close?', x: 1000, y: 150, prob: 85, desc: '15.1% of contracts canceled. 70.4% cite inspection issues', source: 'Redfin Sep 2025', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 8, type: 'outcome-bad', label: 'Deal falls through', x: 1000, y: 350, prob: 100, desc: 'Inspection, appraisal gap, or underwriting failure', source: 'Redfin 2025', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 9, type: 'decision', label: 'Sustain payments long-term?', x: 1250, y: 150, prob: 82, desc: '73% have regrets. Hidden costs: $16K/year. Insurance up 48%', source: 'Clever Real Estate 2024 | Zillow 2025', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 12, type: 'outcome-good', label: 'Homeowner building equity', x: 1500, y: 80, prob: 100, desc: 'Net worth: $396K vs renter $10K (40x). Breakeven: ~5 years', source: 'Federal Reserve SCF 2023', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 13, type: 'outcome-bad', label: 'House poor or foreclosure risk', x: 1500, y: 250, prob: 100, desc: 'Foreclosure rate rising. 44% of recent buyers feel regret', source: 'ATTOM 2025 | Bankrate 2025', sacredRoots: ['SR-031', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'no' }, { from: 4, to: 10, label: 'partial' }, { from: 4, to: 6, label: 'yes' },
      { from: 10, to: 11 }, { from: 11, to: 6, label: 'pass' }, { from: 11, to: 5, label: 'fail' },
      { from: 6, to: 3, label: 'fail' }, { from: 6, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 9, to: 12, label: 'yes' }, { from: 9, to: 13, label: 'no' },
    ]
  },
  buy_house: {
    title: 'Buy a House',
    input: 'Someone wants to buy their first house',
    nodes: [
      { id: 1, type: 'state', label: '1000 people who want to buy their first home', x: 0, y: 200, prob: 100, desc: 'First-time buyers: just 24% of purchases in 2024 -- lowest since 1981. Median age: 38', source: 'NAR Profile of Home Buyers and Sellers 2024', sourceUrl: 'https://www.nar.realtor/', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 2, type: 'action', label: 'Start saving for a down payment', x: 200, y: 200, prob: 100, desc: 'Median down payment: 9% (highest since 1997). On $425K home = $38,250. Avg time: 5-7 years', source: 'NAR 2024', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 3, type: 'bottleneck', label: 'Save enough for down payment + closing?', x: 450, y: 200, prob: 52, desc: '48% say saving is the hardest step. Closing costs add 3-6%. Total: $50K-$65K', source: 'NAR 2024 | NerdWallet 2025', sacredRoots: ['SR-008', 'SR-031'] },
      { id: 4, type: 'action', label: 'Apply for mortgage pre-approval', x: 700, y: 200, prob: 100, desc: 'Lenders check: credit, DTI, income, employment, reserves', source: 'Homebuyer.com 2025', sacredRoots: ['SR-017', 'SR-008'] },
      { id: 5, type: 'gate', label: 'Mortgage pre-approval decision', x: 950, y: 200, prob: 81, desc: 'Approval rate 81%. Top denial: DTI (36%), credit (23%), cash (12%)', source: 'Homebuyer.com HMDA 2025 | NerdWallet 2024', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 6, type: 'action', label: 'Start house hunting', x: 1200, y: 200, prob: 100, desc: 'Avg search: 2-5 months. Median homes viewed: 7. Inventory tight: 3.5 months supply', source: 'NAR 2024 | Redfin 2025', sacredRoots: ['SR-011', 'SR-017'] },
      { id: 7, type: 'bottleneck', label: 'Find a home you can afford?', x: 1450, y: 200, prob: 65, desc: '35% priced out of target area. Median home: $425K', source: 'NAR 2025 | Zillow 2025', sacredRoots: ['SR-031', 'SR-013'] },
      { id: 8, type: 'decision', label: 'Win the bidding?', x: 1700, y: 200, prob: 70, desc: '20% of homes receive multiple offers nationally (mid-2025)', source: 'Redfin Agent Survey June 2025', sacredRoots: ['SR-001', 'SR-017'] },
      { id: 9, type: 'action', label: 'Offer accepted -- begin due diligence', x: 1950, y: 200, prob: 100, desc: 'Inspection ($300-500), appraisal ($400-600), title search. Closing: 41 days avg', source: 'ICE Mortgage Technology 2025', sacredRoots: ['SR-017', 'SR-008'] },
      { id: 10, type: 'gate', label: 'Home inspection results', x: 2200, y: 200, prob: 85, desc: '70.4% of deal failures cite inspection. 15.1% of contracts canceled', source: 'Redfin Sep 2025', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 11, type: 'action', label: 'Final mortgage underwriting + appraisal', x: 2450, y: 200, prob: 100, desc: 'Lender verifies everything again; any new debt or job change can kill deal', source: 'ICE Mortgage Technology 2025', sacredRoots: ['SR-008', 'SR-031'] },
      { id: 12, type: 'bottleneck', label: 'Clear to close?', x: 2700, y: 200, prob: 90, desc: '~10% fail at underwriting: appraisal gaps, employment changes', source: 'ICE Mortgage Technology 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-026'] },
      { id: 13, type: 'action', label: 'Close -- sign papers, get keys', x: 2950, y: 200, prob: 100, desc: 'Closing costs: 3-6% of loan ($11K-$22.5K). Total out-of-pocket: $50K-$85K', source: 'Zillow 2025 | Bankrate 2025', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 14, type: 'state', label: 'You are a homeowner -- reality hits', x: 3200, y: 200, prob: 100, desc: 'Hidden costs: $16K/year on top of mortgage. 83% face unexpected maintenance year 1', source: 'Zillow Hidden Costs Report 2025', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 15, type: 'decision', label: 'Sustain payments long-term?', x: 3450, y: 200, prob: 82, desc: '73% of homeowners have regrets. Insurance up 48% in 5 years', source: 'Clever Real Estate 2024 | Bankrate 2025', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 20, type: 'state', label: 'Cannot save -- stuck renting', x: 450, y: 400, prob: 100, desc: '48% never accumulate enough. Student debt + rent eat savings', source: 'NAR 2024 | Federal Reserve SCF 2023', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 21, type: 'decision', label: 'Try low down payment program?', x: 700, y: 400, prob: 40, desc: '40% explore FHA (3.5%) or VA/USDA (0%). PMI adds $100-300/mo', source: 'Homebuyer.com 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 22, type: 'outcome-bad', label: 'Priced out indefinitely', x: 700, y: 560, prob: 100, desc: 'Average first-time buyer age keeps rising. Some never buy', source: 'NAR 2025', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 25, type: 'state', label: 'Mortgage denied -- DTI or credit', x: 950, y: 420, prob: 100, desc: 'DTI cited in 36% of denials. Denial rate rose to 20.7% in 2024', source: 'NerdWallet 2024', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 26, type: 'decision', label: 'Fix credit and reapply?', x: 1200, y: 420, prob: 50, desc: '50% reapply within 12 months. Credit repair: 3-12 months', source: 'NerdWallet 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 27, type: 'outcome-bad', label: 'Cannot qualify -- remain a renter', x: 1200, y: 560, prob: 100, desc: 'Income instability, self-employment, or persistent credit issues', source: 'NerdWallet 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 28, type: 'state', label: 'Conditional approval -- needs more docs', x: 950, y: 310, prob: 100, desc: 'Lender wants more documentation, larger down payment, or lower debt', source: 'ICE Mortgage Technology 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 29, type: 'bottleneck', label: 'Meet the conditions?', x: 1200, y: 310, prob: 65, desc: '65% of conditionally approved get full approval', source: 'ICE Mortgage Technology 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-008', 'SR-031'] },
      { id: 30, type: 'state', label: 'Nothing affordable in desired area', x: 1450, y: 400, prob: 100, desc: 'Median $425K vs recommended 3x income ratio', source: 'NAR 2025 | Redfin 2025', sacredRoots: ['SR-013', 'SR-031'] },
      { id: 31, type: 'decision', label: 'Expand search or wait?', x: 1700, y: 400, prob: 55, desc: '55% expand radius or compromise. 45% pause and wait', source: 'NAR 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 32, type: 'outcome-bad', label: 'Waiting indefinitely -- market keeps rising', x: 1700, y: 560, prob: 100, desc: 'Home prices up every year since 2012', source: 'Redfin 2025', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 33, type: 'state', label: 'Outbid -- back to searching', x: 1700, y: 50, prob: 100, desc: 'In competitive markets, 2-5 offers before one accepted', source: 'NAR 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 35, type: 'state', label: 'Major structural issues found', x: 2200, y: 420, prob: 100, desc: 'Foundation, mold, faulty wiring, roof ($10K-$30K)', source: 'Redfin Sep 2025', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 36, type: 'outcome-bad', label: 'Walk away -- back to square one', x: 2450, y: 420, prob: 100, desc: 'Lost inspection fees and weeks of effort', source: 'HomeLight 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 37, type: 'state', label: 'Minor issues -- negotiate repairs', x: 2200, y: 320, prob: 100, desc: 'Buyer requests seller credit $2K-$10K or repairs', source: 'Redfin Sep 2025', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 38, type: 'bottleneck', label: 'Seller agrees to concessions?', x: 2450, y: 320, prob: 70, desc: '70% of negotiated requests result in some concession', source: 'NAR 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 39, type: 'outcome-bad', label: 'Seller refuses -- deal collapses', x: 2700, y: 380, prob: 100, desc: 'Walk away or overpay for known-deficient property', source: 'NAR 2024 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 40, type: 'state', label: 'Appraisal gap or underwriting rejection', x: 2700, y: 400, prob: 100, desc: 'Home appraised below price; must cover gap in cash', source: 'ICE Mortgage Technology 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-026'] },
      { id: 41, type: 'outcome-bad', label: 'Deal falls through at finish line', x: 2950, y: 400, prob: 100, desc: 'Lost all fees and weeks of effort', source: 'ICE Mortgage Technology 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 42, type: 'outcome-good', label: 'Homeowner building equity and wealth', x: 3700, y: 120, prob: 100, desc: 'Homeowner net worth: $396K vs renter $10K (40x). Breakeven vs renting: ~5 years', source: 'Federal Reserve SCF 2023 | NAR 2025', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 43, type: 'state', label: 'Financial strain -- house poor', x: 3450, y: 380, prob: 100, desc: '44% of recent buyers feel regret. Insurance up 48%. 83% hit unexpected costs year 1', source: 'Bankrate 2025 | Clever Real Estate 2024', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 44, type: 'bottleneck', label: 'Avoid foreclosure?', x: 3700, y: 380, prob: 95, desc: 'Foreclosure filings up 20% in 2025. Overall rate still ~0.3%', source: 'ATTOM Data 2025', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 45, type: 'outcome-bad', label: 'Foreclosure -- lost home + credit destroyed', x: 3950, y: 450, prob: 100, desc: 'On credit report 7 years. Score drop 100-160 points', source: 'ATTOM Data 2025', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 46, type: 'outcome-bad', label: 'House poor but surviving -- no freedom', x: 3950, y: 320, prob: 100, desc: 'Making payments but nothing left for savings or emergencies', source: 'Zillow Hidden Costs Report 2025', sacredRoots: ['SR-031', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 20, label: 'fail' }, { from: 3, to: 4, label: 'pass' },
      { from: 20, to: 21 }, { from: 21, to: 4, label: 'yes' }, { from: 21, to: 22, label: 'no' },
      { from: 4, to: 5 },
      { from: 5, to: 25, label: 'no' }, { from: 5, to: 28, label: 'partial' }, { from: 5, to: 6, label: 'yes' },
      { from: 25, to: 26 }, { from: 26, to: 4, label: 'yes' }, { from: 26, to: 27, label: 'no' },
      { from: 28, to: 29 }, { from: 29, to: 6, label: 'pass' }, { from: 29, to: 25, label: 'fail' },
      { from: 6, to: 7 },
      { from: 7, to: 30, label: 'fail' }, { from: 7, to: 8, label: 'pass' },
      { from: 30, to: 31 }, { from: 31, to: 6, label: 'yes' }, { from: 31, to: 32, label: 'no' },
      { from: 8, to: 33, label: 'no' }, { from: 8, to: 9, label: 'yes' },
      { from: 33, to: 6 },
      { from: 9, to: 10 },
      { from: 10, to: 35, label: 'no' }, { from: 10, to: 37, label: 'partial' }, { from: 10, to: 11, label: 'yes' },
      { from: 35, to: 36 },
      { from: 37, to: 38 }, { from: 38, to: 11, label: 'pass' }, { from: 38, to: 39, label: 'fail' },
      { from: 11, to: 12 },
      { from: 12, to: 40, label: 'fail' }, { from: 12, to: 13, label: 'pass' },
      { from: 40, to: 41 },
      { from: 13, to: 14 }, { from: 14, to: 15 },
      { from: 15, to: 42, label: 'yes' }, { from: 15, to: 43, label: 'no' },
      { from: 43, to: 44 }, { from: 44, to: 46, label: 'pass' }, { from: 44, to: 45, label: 'fail' },
    ]
  },
};
