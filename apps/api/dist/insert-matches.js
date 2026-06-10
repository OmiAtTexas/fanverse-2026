"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const matches = require('/tmp/matches.json');
const prisma = new client_1.PrismaClient();
function mapStage(stage) {
    const map = {
        'GROUP_STAGE': 'GROUP',
        'LAST_16': 'ROUND_OF_16',
        'QUARTER_FINALS': 'QUARTER_FINAL',
        'SEMI_FINALS': 'SEMI_FINAL',
        'FINAL': 'FINAL',
        'THIRD_PLACE': 'THIRD_PLACE',
        'ROUND_OF_16': 'ROUND_OF_16',
    };
    return map[stage] || 'GROUP';
}
async function main() {
    console.log('Inserting 104 World Cup 2026 matches...');
    let count = 0;
    for (const m of matches) {
        await prisma.worldCupMatch.upsert({
            where: { externalId: m.externalId },
            create: { ...m, stage: mapStage(m.stage) },
            update: { homeTeam: m.homeTeam, awayTeam: m.awayTeam, stage: mapStage(m.stage) },
        });
        count++;
    }
    console.log(`✅ Done! ${count} real matches inserted.`);
    await prisma.$disconnect();
}
main().catch(console.error);
//# sourceMappingURL=insert-matches.js.map