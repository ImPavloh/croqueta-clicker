import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  GameSummary,
  ProducerReportData,
  UpgradeReportData,
  AchievementReportData,
  SkinReportData,
  EfficiencyData,
  LeaderboardStats,
} from '@models/report.model';

export interface ReportPdfPayload {
  summary: GameSummary;
  producers: ProducerReportData[];
  upgrades: UpgradeReportData[];
  achievements: AchievementReportData[];
  efficiency: EfficiencyData;
  upgradesByLevel: { name: string; value: number }[];
  achievementsStatus: { name: string; value: number; percentage: number }[];
  skinRarity: { name: string; value: number }[];
  skins?: SkinReportData[];
  leaderboardStats?: LeaderboardStats | null;
  leaderboardTop?: Array<{ username: string; score: number }> | null;
  localeTitle: string;
  labels: Record<string, string>;
  debugInfo?: {
    playerRows: string[][];
    debugRows: string[][];
    multiplayerRows: string[][];
  };
}

@Injectable({ providedIn: 'root' })
export class ReportPdfService {
  exportReport(payload: ReportPdfPayload): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let cursorY = margin;
    const l = payload.labels;

    doc.setFontSize(18);
    doc.text(payload.localeTitle, margin, cursorY);
    cursorY += 18;
    doc.setFontSize(10);
    doc.text(payload.summary.generatedAt, margin, cursorY);
    cursorY += 24;

    // jugador (individual)
    cursorY = this.sectionTitle(doc, `1. ${l['playerTitle']}`, cursorY, margin);

    autoTable(doc, {
      startY: cursorY,
      head: [[l['metricLabel'], l['valueLabel']]],
      body: payload.debugInfo?.playerRows ?? [],
      styles: { fontSize: 9 },
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['efficiencyTitle'], cursorY, margin);
    autoTable(doc, {
      startY: cursorY,
      head: [[l['metricLabel'], l['valueLabel']]],
      body: [
        [l['clicksPerMinuteLabel'], String(payload.efficiency.clicksPerMinute)],
        [l['croquetasPerMinuteLabel'], payload.efficiency.croquetasPerMinute],
        [l['avgCpsPerProducerLabel'], payload.efficiency.avgCpsPerProducer],
        [
          l['topProducerLabel'],
          `${payload.efficiency.topProducer} (${payload.efficiency.topProducerCps}/s)`,
        ],
      ],
      styles: { fontSize: 9 },
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['producersTitle'], cursorY, margin);
    autoTable(doc, {
      startY: cursorY,
      head: [['#', l['producerNameLabel'], l['quantityLabel'], l['cpsLabel'], l['percentLabel']]],
      body: payload.producers.map((p) => [
        String(p.id),
        p.name,
        String(p.quantity),
        String(p.cpsContribution),
        `${p.cpsPercentage}%`,
      ]),
      styles: { fontSize: 8 },
      theme: 'striped',
      pageBreak: 'auto',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['upgradesTitle'], cursorY, margin);
    autoTable(doc, {
      startY: cursorY,
      head: [
        [
          '#',
          l['upgradeNameLabel'],
          l['clickBonusLabel'],
          l['requiredLevelLabel'],
          l['statusLabel'],
        ],
      ],
      body: payload.upgrades.map((u) => [
        String(u.id),
        u.name,
        `+${u.clicks}`,
        String(u.level),
        u.bought ? l['stateBoughtLabel'] : l['stateLockedLabel'],
      ]),
      styles: { fontSize: 8 },
      theme: 'striped',
      pageBreak: 'auto',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['upgradeDistributionTitle'], cursorY, margin);
    cursorY = this.drawBarChart(doc, payload.upgradesByLevel, cursorY + 4, margin);

    cursorY = this.sectionTitle(doc, l['achievementsTitle'], cursorY + 4, margin);
    autoTable(doc, {
      startY: cursorY,
      head: [[l['achievementLabel'], l['stateLabel']]],
      body: payload.achievements.map((a) => [
        a.title,
        a.unlocked ? l['stateUnlockedLabel'] : l['stateLockedLabel'],
      ]),
      styles: { fontSize: 8 },
      theme: 'striped',
      pageBreak: 'auto',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['achievementStatusTitle'], cursorY, margin);
    autoTable(doc, {
      startY: cursorY,
      head: [[l['stateLabel'], l['quantityLabel'], '%']],
      body: payload.achievementsStatus.map((s) => [s.name, String(s.value), `${s.percentage}%`]),
      styles: { fontSize: 9 },
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 16;

    //  debug
    cursorY = this.sectionTitle(doc, `2. ${l['debugTitle']}`, cursorY, margin);

    autoTable(doc, {
      startY: cursorY,
      head: [[l['metricLabel'], l['valueLabel']]],
      body: payload.debugInfo?.debugRows ?? [],
      styles: { fontSize: 9 },
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['summaryTitle'], cursorY, margin);
    autoTable(doc, {
      startY: cursorY,
      head: [
        [
          'Croquetas',
          'CpS',
          'CpC',
          'Clicks',
          l['levelLabel'],
          l['timeLabel'],
          l['multiplierLabel'],
          l['producersLabel'],
        ],
      ],
      body: [
        [
          payload.summary.totalCroquetas,
          payload.summary.croquetasPerSecond,
          payload.summary.croquetasPerClick,
          String(payload.summary.totalClicks),
          String(payload.summary.level),
          payload.summary.timePlayingFormatted,
          `x${payload.summary.multiplier}`,
          String(payload.summary.totalProducers),
        ],
      ],
      styles: { fontSize: 8 },
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['skinRarityTitle'], cursorY, margin);
    cursorY = this.drawBarChart(doc, payload.skinRarity, cursorY + 4, margin);
    cursorY += 16;

    // skins
    if (payload.skins && payload.skins.length > 0) {
      cursorY = this.sectionTitle(doc, l['skinsTitle'] ?? 'Skins', cursorY, margin);
      autoTable(doc, {
        startY: cursorY,
        head: [['#', l['skinNameLabel'] ?? 'Skin', l['rarityLabel'] ?? 'Rarity', l['requirementLabel'] ?? 'Requirement', l['statusLabel']  ?? 'Status']],
        body: payload.skins.map((s) => [
          String(s.id),
          s.name,
          s.rarity,
          s.requirement,
          s.unlocked ? (l['stateUnlockedLabel'] ?? '✓') : (l['stateLockedLabel'] ?? '✗'),
        ]),
        styles: { fontSize: 8 },
        theme: 'striped',
        pageBreak: 'auto',
      });
      cursorY = (doc as any).lastAutoTable.finalY + 12;
    }

    //  multijugador
    if (payload.leaderboardStats || (payload.debugInfo?.multiplayerRows?.length ?? 0) > 0) {
      cursorY = this.sectionTitle(doc, `3. ${l['multiplayerTitle']}`, cursorY, margin);

      if (payload.debugInfo?.multiplayerRows?.length) {
        autoTable(doc, {
          startY: cursorY,
          head: [[l['metricLabel'], l['valueLabel']]],
          body: payload.debugInfo.multiplayerRows,
          styles: { fontSize: 9 },
          theme: 'grid',
        });
        cursorY = (doc as any).lastAutoTable.finalY + 12;
      }

      if (payload.leaderboardStats) {
        cursorY = this.sectionTitle(doc, l['leaderboardDistributionTitle'], cursorY, margin);
        cursorY = this.drawBarChart(
          doc,
          payload.leaderboardStats.buckets.map((b) => ({ name: b.label, value: b.count })),
          cursorY + 4,
          margin,
        );

        if (payload.leaderboardTop && payload.leaderboardTop.length > 0) {
          cursorY = this.sectionTitle(doc, l['leaderboardTopTitle'], cursorY + 8, margin);
          autoTable(doc, {
            startY: cursorY,
            head: [['#', l['userLabel'], l['levelLabel']]],
            body: payload.leaderboardTop.map((t, i) => [
              String(i + 1),
              t.username,
              String(t.score),
            ]),
            styles: { fontSize: 9 },
            theme: 'grid',
          });
        }
      }
    }

    doc.save('croquetaclicker-report.pdf');
  }

  private sectionTitle(doc: jsPDF, text: string, y: number, x: number): number {
    if (y > 750) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(12);
    doc.setTextColor(60, 47, 27);
    doc.text(text, x, y);
    return y + 8;
  }

  private drawBarChart(
    doc: jsPDF,
    items: { name: string; value: number }[],
    startY: number,
    x: number,
  ): number {
    if (startY > 700) {
      doc.addPage();
      startY = 40;
    }
    const maxWidth = 520;
    const barHeight = 10;
    const gap = 6;
    const maxValue = Math.max(...items.map((i) => i.value), 1);
    let y = startY;

    doc.setFontSize(9);
    for (const item of items) {
      if (y > 780) {
        doc.addPage();
        y = 40;
      }
      const width = (item.value / maxValue) * maxWidth;
      doc.setTextColor(80);
      doc.text(item.name, x, y + 8);
      doc.setFillColor(196, 129, 61);
      doc.rect(x + 120, y, width, barHeight, 'F');
      doc.setTextColor(60);
      doc.text(String(item.value), x + 120 + width + 6, y + 8);
      y += barHeight + gap;
    }

    return y + 4;
  }
}
