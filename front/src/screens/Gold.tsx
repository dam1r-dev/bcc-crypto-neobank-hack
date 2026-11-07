// Экран актива «Золото» (P1-10): цена продажи, график за месяц (синтетика), курсы рядом, моё золото, цель «1 г».
import { Button, Card, NavBar, PriceRow, RiskBanner } from '../components/ui';
import { CUSTODY, GOLD, GOLD_MONTH, GOLD_MONTH_LABELS } from '../mocks/data';
import { grams, kzt, signedKzt, signedPct } from '../lib/format';
import { changePct, valueUg } from '../lib/calc';
import { useStore } from '../store';

const W = 342;
const H = 120;

function MonthChart() {
  const min = Math.min(...GOLD_MONTH);
  const max = Math.max(...GOLD_MONTH);
  const pad = (max - min) * 0.12;
  const lo = min - pad;
  const hi = max + pad;
  const x = (i: number) => (i / (GOLD_MONTH.length - 1)) * W;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const d = GOLD_MONTH.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = GOLD_MONTH.length - 1;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[120px] w-full overflow-visible" role="img"
        aria-label={`Синтетическая цена продажи за месяц: от ${kzt(GOLD_MONTH[0])} до ${kzt(GOLD_MONTH[last])}`}>
        <path d={`${d} L${W},${H} L0,${H} Z`} fill="var(--gold-tint)" />
        <path d={d} fill="none" stroke="var(--gold-bar)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(last)} cy={y(GOLD_MONTH[last])} r="4" fill="var(--gold-bar)" stroke="var(--surface)" strokeWidth="2" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        {GOLD_MONTH_LABELS.map((l) => <span key={l}>{l}</span>)}
      </div>
      <figcaption className="mt-1 text-[11px] text-muted">Синтетические данные · не рыночные данные</figcaption>
    </figure>
  );
}

const MARKS = [0.1, 0.25, 0.5, 1];

export function Gold() {
  const { s, d } = useStore();
  const ug = s.ledger.goldUg;
  const value = valueUg(ug, GOLD.bid);
  const monthDelta = GOLD.bid - GOLD_MONTH[0];
  const monthPct = changePct(GOLD.bid, GOLD_MONTH[0]);
  const progress = Math.min(100, ug / 10_000);
  const nextMark = MARKS.find((m) => ug < m * 1_000_000);

  return (
    <div className="flex h-full flex-col">
      <NavBar title="Золото" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        <Card>
          <div className="text-[13px] text-muted">Цена продажи · 1 г</div>
          <div className="tnum amount-hero mt-1 text-[32px] font-semibold leading-[40px]">{kzt(GOLD.bid)}</div>
          <div className="tnum text-[13px] text-muted">{signedKzt(monthDelta)} ({signedPct(monthPct)}) за месяц</div>
          <div className="mt-3"><MonthChart /></div>
        </Card>

        <PriceRow ask={GOLD.ask} bid={GOLD.bid} />

        <Card className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-[13px] font-semibold text-text" aria-hidden>Au</span>
              <div>
                <div className="text-[15px] font-semibold">Моё золото</div>
                <div className="text-[13px] text-muted">Хранит {CUSTODY.gold}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="tnum text-[17px] font-semibold text-gold">{grams(ug)}</div>
              <div className="tnum text-[13px] text-muted">{ug > 0 ? `≈ ${kzt(value)} если продать сейчас` : 'пока нет'}</div>
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[13px] text-muted">
              <span>Цель — 1 г</span>
              <span className="tnum">{nextMark ? `следующая отметка ${String(nextMark).replace('.', ',')} г` : 'цель достигнута'}</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-surface2">
              <div className="h-full rounded-full bg-gold-bar" style={{ width: `${progress}%` }} />
              {MARKS.slice(0, -1).map((m) => (
                <span key={m} className="absolute top-0 h-full w-0.5 bg-surface" style={{ left: `${m * 100}%` }} aria-hidden />
              ))}
            </div>
            <div className="tnum relative mt-1 h-4 text-[11px] text-muted">
              <span className="absolute left-0">0</span>
              {MARKS.slice(0, -1).map((m) => (
                <span key={m} className="absolute -translate-x-1/2" style={{ left: `${m * 100}%` }}>{String(m).replace('.', ',')}</span>
              ))}
              <span className="absolute right-0">1 г</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => { d({ type: 'DRAFT_BUY', amount: null }); d({ type: 'NAV', to: 'buy' }); }}>Купить</Button>
          <Button variant="secondary" disabled={ug === 0} onClick={() => d({ type: 'NAV', to: 'sell' })}>Продать</Button>
        </div>
        <RiskBanner />
        <div className="flex flex-col">
          <Button variant="ghost" onClick={() => d({ type: 'SHEET', sheet: 'pricing' })}>Как считается цена</Button>
          <Button variant="ghost" onClick={() => d({ type: 'SHEET', sheet: 'custody' })}>Кто хранит ваши активы</Button>
        </div>
      </div>
    </div>
  );
}
