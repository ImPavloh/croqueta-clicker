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
  upgradeClickCurve: { name: string; value: number }[];
  cumulativeUpgradeCurve: { name: string; value: number }[];
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
    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = margin;
    const l = payload.labels;
    const baseTableOptions = {
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - margin * 2,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak' as const,
        textColor: [75, 59, 27] as [number, number, number],
      },
      headStyles: {
        fillColor: [196, 129, 61] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: 'bold' as const,
      },
      alternateRowStyles: {
        fillColor: [255, 248, 232] as [number, number, number],
      },
    };

    doc.setFontSize(18);
    doc.text(payload.localeTitle, margin, cursorY);
    cursorY += 18;
    doc.setFontSize(10);
    doc.text(payload.summary.generatedAt, margin, cursorY);
    cursorY += 24;

    // jugador (individual)
    cursorY = this.sectionTitle(doc, `1. ${l['playerTitle']}`, cursorY, margin);

    autoTable(doc, {
      ...baseTableOptions,
      startY: cursorY,
      head: [[l['metricLabel'], l['valueLabel']]],
      body: payload.debugInfo?.playerRows ?? [],
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['efficiencyTitle'], cursorY, margin);
    autoTable(doc, {
      ...baseTableOptions,
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
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['producersTitle'], cursorY, margin);
    autoTable(doc, {
      ...baseTableOptions,
      startY: cursorY,
      head: [['#', l['producerNameLabel'], l['quantityLabel'], l['cpsLabel'], l['percentLabel']]],
      body: payload.producers.map((p) => [
        String(p.id),
        p.name,
        String(p.quantity),
        String(p.cpsContribution),
        `${p.cpsPercentage}%`,
      ]),
      styles: { ...baseTableOptions.styles, fontSize: 8 },
      theme: 'striped',
      pageBreak: 'auto',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['upgradesTitle'], cursorY, margin);
    autoTable(doc, {
      ...baseTableOptions,
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
      styles: { ...baseTableOptions.styles, fontSize: 8 },
      theme: 'striped',
      pageBreak: 'auto',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['upgradeDistributionTitle'], cursorY, margin);
    cursorY = this.drawBarChart(doc, payload.upgradesByLevel, cursorY + 4, margin);

    if (payload.upgradeClickCurve.length > 0) {
      cursorY = this.sectionTitle(
        doc,
        l['upgradeClickCurveTitle'] ?? 'Upgrade click-bonus curve',
        cursorY + 8,
        margin,
      );
      cursorY = this.drawTrendChart(doc, payload.upgradeClickCurve, cursorY + 6, margin, 'line');
    }

    if (payload.cumulativeUpgradeCurve.length > 0) {
      cursorY = this.sectionTitle(
        doc,
        l['cumulativeUpgradeCurveTitle'] ?? 'Cumulative bonus by level',
        cursorY + 8,
        margin,
      );
      cursorY = this.drawTrendChart(
        doc,
        payload.cumulativeUpgradeCurve,
        cursorY + 6,
        margin,
        'area',
      );
    }

    cursorY = this.sectionTitle(doc, l['achievementsTitle'], cursorY + 4, margin);
    autoTable(doc, {
      ...baseTableOptions,
      startY: cursorY,
      head: [[l['achievementLabel'], l['stateLabel']]],
      body: payload.achievements.map((a) => [
        a.title,
        a.unlocked ? l['stateUnlockedLabel'] : l['stateLockedLabel'],
      ]),
      styles: { ...baseTableOptions.styles, fontSize: 8 },
      theme: 'striped',
      pageBreak: 'auto',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['achievementStatusTitle'], cursorY, margin);
    autoTable(doc, {
      ...baseTableOptions,
      startY: cursorY,
      head: [[l['stateLabel'], l['quantityLabel'], '%']],
      body: payload.achievementsStatus.map((s) => [s.name, String(s.value), `${s.percentage}%`]),
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 16;

    //  debug
    cursorY = this.sectionTitle(doc, `2. ${l['debugTitle']}`, cursorY, margin);

    autoTable(doc, {
      ...baseTableOptions,
      startY: cursorY,
      head: [[l['metricLabel'], l['valueLabel']]],
      body: payload.debugInfo?.debugRows ?? [],
      theme: 'grid',
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;

    cursorY = this.sectionTitle(doc, l['summaryTitle'], cursorY, margin);
    autoTable(doc, {
      ...baseTableOptions,
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
      styles: { ...baseTableOptions.styles, fontSize: 8 },
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
        ...baseTableOptions,
        startY: cursorY,
        head: [
          [
            '#',
            l['skinNameLabel'] ?? 'Skin',
            l['rarityLabel'] ?? 'Rarity',
            l['requirementLabel'] ?? 'Requirement',
            l['statusLabel'] ?? 'Status',
          ],
        ],
        body: payload.skins.map((s) => [
          String(s.id),
          s.name,
          s.rarity,
          s.requirement,
          s.unlocked ? (l['stateUnlockedLabel'] ?? '✓') : (l['stateLockedLabel'] ?? '✗'),
        ]),
        styles: { ...baseTableOptions.styles, fontSize: 8 },
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
          ...baseTableOptions,
          startY: cursorY,
          head: [[l['metricLabel'], l['valueLabel']]],
          body: payload.debugInfo.multiplayerRows,
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
            ...baseTableOptions,
            startY: cursorY,
            head: [['#', l['userLabel'], l['scoreLabel'] ?? l['valueLabel']]],
            body: payload.leaderboardTop.map((t, i) => [
              String(i + 1),
              t.username,
              String(t.score),
            ]),
            theme: 'grid',
          });
        }
      }
    }

    doc.save('croquetaclicker-report.pdf');
  }

  private sectionTitle(doc: jsPDF, text: string, y: number, x: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y > pageHeight - 60) {
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
    if (items.length === 0) {
      return startY;
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const rightMargin = x;
    const labelWidth = 120;
    const valueWidth = 56;
    const trackGap = 12;
    const trackX = x + labelWidth + trackGap;
    const maxWidth = Math.max(110, pageWidth - rightMargin - trackX - valueWidth - 4);
    const barHeight = 10;
    const gap = 10;
    const maxValue = Math.max(...items.map((i) => i.value), 1);
    let y = startY;

    doc.setFontSize(9);
    for (const item of items) {
      const labelLines = doc.splitTextToSize(item.name, labelWidth - 4);
      const rowHeight = Math.max(barHeight, labelLines.length * 10);

      if (y + rowHeight + gap > pageHeight - 40) {
        doc.addPage();
        y = 40;
      }

      const width = (item.value / maxValue) * maxWidth;
      const trackY = y + Math.max(0, (rowHeight - barHeight) / 2);
      const valueText = item.value.toLocaleString();

      doc.setTextColor(80);
      doc.text(labelLines, x, y + 8);
      doc.setFillColor(238, 226, 197);
      doc.roundedRect(trackX, trackY, maxWidth, barHeight, 5, 5, 'F');
      doc.setFillColor(196, 129, 61);
      if (width > 0) {
        doc.roundedRect(trackX, trackY, width, barHeight, 5, 5, 'F');
      }
      doc.setTextColor(60);
      doc.text(valueText, trackX + maxWidth + valueWidth, trackY + 8, { align: 'right' });
      y += rowHeight + gap;
    }

    return y + 4;
  }

  private drawTrendChart(
    doc: jsPDF,
    items: { name: string; value: number }[],
    startY: number,
    x: number,
    variant: 'line' | 'area',
  ): number {
    if (items.length === 0) {
      return startY;
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const chartHeight = 180;
    const cardHeight = 222;
    const width = pageWidth - x * 2;

    let y = startY;
    if (y + cardHeight > pageHeight - 40) {
      doc.addPage();
      y = 40;
    }

    const cardX = x;
    const cardY = y;
    const plotX = cardX + 52;
    const plotY = cardY + 18;
    const plotWidth = width - 68;
    const plotHeight = chartHeight - 44;
    const baseY = plotY + plotHeight;
    const positiveValues = items.map((item) => item.value).filter((value) => value > 0);
    const minValue = positiveValues.length > 0 ? Math.min(...positiveValues) : 1;
    const maxValue = positiveValues.length > 0 ? Math.max(...positiveValues) : 1;
    const normalizeValue = (value: number): number => {
      const safeValue = Math.max(value, minValue);
      const logMin = Math.log10(minValue);
      const logMax = Math.log10(maxValue);
      const logValue = Math.log10(safeValue);

      if (logMax === logMin) return 1;
      return (logValue - logMin) / (logMax - logMin);
    };

    const denormalizeValue = (ratio: number): number => {
      const logMin = Math.log10(minValue);
      const logMax = Math.log10(maxValue);
      return Math.pow(10, logMin + (logMax - logMin) * ratio);
    };

    const stepX = items.length > 1 ? plotWidth / (items.length - 1) : 0;
    const points = items.map((item, index) => ({
      ...item,
      x: items.length === 1 ? plotX + plotWidth / 2 : plotX + stepX * index,
      y: plotY + plotHeight - normalizeValue(item.value) * plotHeight,
    }));
    const labelStride = points.length <= 6 ? 1 : Math.ceil((points.length - 1) / 5);

    doc.setDrawColor(184, 156, 90);
    doc.setFillColor(255, 248, 232);
    doc.roundedRect(cardX, cardY, width, chartHeight, 12, 12, 'FD');

    for (let index = 0; index <= 4; index++) {
      const ratio = index / 4;
      const tickY = plotY + plotHeight * ratio;
      const tickValue = denormalizeValue(1 - ratio);

      doc.setDrawColor(226, 214, 186);
      doc.setLineDashPattern([3, 4], 0);
      doc.line(plotX, tickY, plotX + plotWidth, tickY);
      doc.setLineDashPattern([], 0);

      doc.setFontSize(8);
      doc.setTextColor(139, 115, 85);
      doc.text(this.formatCompactNumber(tickValue), plotX - 8, tickY + 3, { align: 'right' });
    }

    doc.setDrawColor(102, 79, 34);
    doc.line(plotX, plotY, plotX, baseY);
    doc.line(plotX, baseY, plotX + plotWidth, baseY);

    if (variant === 'area') {
      doc.setDrawColor(245, 214, 162);
      doc.setLineWidth(0.8);
      for (const point of points) {
        doc.line(point.x, point.y, point.x, baseY);
      }
    }

    doc.setDrawColor(184, 103, 21);
    doc.setLineWidth(2);
    for (let index = 1; index < points.length; index++) {
      const prev = points[index - 1];
      const current = points[index];
      doc.line(prev.x, prev.y, current.x, current.y);
    }

    doc.setFillColor(255, 248, 232);
    for (const point of points) {
      doc.circle(point.x, point.y, 2.6, 'FD');
    }

    doc.setFontSize(8);
    doc.setTextColor(139, 115, 85);
    for (let index = 0; index < points.length; index++) {
      if (index !== 0 && index !== points.length - 1 && index % labelStride !== 0) {
        continue;
      }

      const point = points[index];
      doc.line(point.x, baseY, point.x, baseY + 4);
      doc.text(point.name, point.x, baseY + 14, { align: 'center' });
    }

    const startPoint = items[0];
    const peakPoint = items.reduce(
      (best, item) => (item.value > best.value ? item : best),
      items[0],
    );
    const endPoint = items[items.length - 1];
    const stats = [
      { label: startPoint.name, value: this.formatCompactNumber(startPoint.value) },
      { label: peakPoint.name, value: this.formatCompactNumber(peakPoint.value) },
      { label: endPoint.name, value: this.formatCompactNumber(endPoint.value) },
    ];
    const statWidth = (width - 16) / 3;
    const statY = cardY + chartHeight + 8;

    for (let index = 0; index < stats.length; index++) {
      const statX = cardX + index * statWidth;
      const stat = stats[index];

      doc.setDrawColor(index === 1 ? 184 : 212, index === 1 ? 103 : 184, index === 1 ? 21 : 150);
      doc.setFillColor(255, 248, 232);
      doc.roundedRect(statX, statY, statWidth - 8, 26, 8, 8, 'FD');
      doc.setFontSize(7);
      doc.setTextColor(139, 115, 85);
      doc.text(stat.label, statX + 8, statY + 10);
      doc.setFontSize(9);
      doc.setTextColor(75, 59, 27);
      doc.text(stat.value, statX + 8, statY + 20);
    }

    return statY + 34;
  }

  private formatCompactNumber(value: number): string {
    const absolute = Math.abs(value);
    if (absolute >= 1e12) return `${(value / 1e12).toFixed(absolute >= 1e14 ? 0 : 1)}T`;
    if (absolute >= 1e9) return `${(value / 1e9).toFixed(absolute >= 1e11 ? 0 : 1)}B`;
    if (absolute >= 1e6) return `${(value / 1e6).toFixed(absolute >= 1e8 ? 0 : 1)}M`;
    if (absolute >= 1e3) return `${(value / 1e3).toFixed(absolute >= 1e5 ? 0 : 1)}K`;
    return Math.round(value).toLocaleString();
  }
}
