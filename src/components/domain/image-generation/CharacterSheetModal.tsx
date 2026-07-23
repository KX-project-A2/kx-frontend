import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Figma-sourced typography (Image_ChracterSheet_Modal, node 283:18032) */
const TEXT_HEADING: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 500,
  fontSize: '20px',
  lineHeight: '28px',
};
const TEXT_LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '24px',
};
const TEXT_VALUE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
};
const TEXT_PILL: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '20px',
};
const TEXT_BUTTON: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
};
const TEXT_BUTTON_STRONG: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '24px',
};

/* ------------------------------------------------------------------ */
/* Options (Figma frame only exposes each dropdown's closed/selected
   state — the shown value is kept as the default below) */
const GENDER_OPTIONS = ['여성', '남성', '중성적'] as const;
const AGE_GROUP_OPTIONS = ['10대', '20대', '30대', '40대', '50대 이상'] as const;
const BODY_TYPE_OPTIONS = ['슬림', '보통', '근육질', '통통'] as const;
const HAIR_LENGTH_OPTIONS = ['숏컷', '단발', '중단발', '장발'] as const;
const HAIR_STYLE_OPTIONS = ['스트레이트', '웨이브', '컬', '포니테일', '트윈테일'] as const;
const EXPRESSION_OPTIONS = ['무표정', '미소', '활짝 웃음', '진지함', '놀람'] as const;
const STYLE_OPTIONS = ['일러스트', '3D', '애니메이션', '실사', '만화'] as const;
const WORLD_SETTING_OPTIONS = ['현대도시', '판타지', 'SF', '사이버펑크', '동양풍'] as const;
const OUTFIT_GENRE_OPTIONS = ['캐주얼', 'SF/사이버펑크', '판타지', '스쿨', '밀리터리'] as const;
const ACCESSORY_OPTIONS = ['안경', '모자', '귀걸이', '목걸이', '스카프'] as const;

export interface CharacterSheetFormData {
  gender: (typeof GENDER_OPTIONS)[number];
  ageGroup: (typeof AGE_GROUP_OPTIONS)[number];
  bodyType: (typeof BODY_TYPE_OPTIONS)[number];
  style: (typeof STYLE_OPTIONS)[number];
  worldSetting: (typeof WORLD_SETTING_OPTIONS)[number];
  hairLength: (typeof HAIR_LENGTH_OPTIONS)[number];
  hairStyle: (typeof HAIR_STYLE_OPTIONS)[number];
  hairColor: string;
  expression: (typeof EXPRESSION_OPTIONS)[number];
  eyeColor: string;
  outfitGenre: (typeof OUTFIT_GENRE_OPTIONS)[number];
  outfitColor: string;
  accessories: (typeof ACCESSORY_OPTIONS)[number][];
}

const DEFAULT_FORM_DATA: CharacterSheetFormData = {
  gender: '여성',
  ageGroup: '20대',
  bodyType: '슬림',
  style: '애니메이션',
  worldSetting: '사이버펑크',
  hairLength: '장발',
  hairStyle: '웨이브',
  hairColor: '#E36EFF',
  expression: '미소',
  eyeColor: '#EAFB2F',
  outfitGenre: 'SF/사이버펑크',
  outfitColor: '#000000',
  accessories: [],
};

/* ------------------------------------------------------------------ */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full items-center py-2">
      <span className="w-[180px] shrink-0 text-content-secondary" style={TEXT_LABEL}>
        {label}
      </span>
      <div className="flex flex-1 items-start">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full shrink-0" style={{ background: 'var(--surface-3)' }} />;
}

function FieldSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative w-[320px]" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center justify-between rounded-lg px-3 text-content transition-colors hover:border-selected-border"
        style={{ background: 'var(--surface-3)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <span className="truncate" style={TEXT_VALUE}>
          {value}
        </span>
        <ChevronDown size={18} strokeWidth={2} className="shrink-0 text-content-muted" />
      </button>
      {open && (
        <div
          className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-lg p-1 shadow-xl"
          style={{ background: 'var(--surface-3)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-content-secondary hover:bg-surface-2 hover:text-content"
              style={TEXT_VALUE}
            >
              <span className="truncate text-left">{opt}</span>
              {opt === value && (
                <Check size={15} strokeWidth={2} style={{ color: 'var(--brand-light)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function pillStyle(selected: boolean): React.CSSProperties {
  return selected
    ? {
        background: 'rgba(240, 165, 255, 0.2)',
        border: '1px solid var(--primary-300)',
        color: 'var(--primary-100)',
      }
    : {
        background: 'var(--surface-3)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--content-muted)',
      };
}

function FieldPillGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-1 flex-wrap items-start gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="rounded-chip px-4 py-2 transition-colors"
          style={{ ...TEXT_PILL, ...pillStyle(opt === value) }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function FieldPillGroupMulti<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T[];
  options: readonly T[];
  onChange: (v: T[]) => void;
}) {
  const toggle = (opt: T) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };
  return (
    <div className="flex flex-1 flex-wrap items-start gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className="rounded-chip px-4 py-2 transition-colors"
          style={{ ...TEXT_PILL, ...pillStyle(value.includes(opt)) }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="flex w-[320px] items-center gap-2.5 rounded-lg px-3 py-2.5"
      style={{ background: 'var(--surface-3)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <div
        className="relative h-5 w-5 shrink-0 overflow-hidden rounded"
        style={{ background: value, border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 bg-transparent text-content outline-none"
        style={TEXT_VALUE}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
export interface CharacterSheetModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (data: CharacterSheetFormData) => void;
}

export function CharacterSheetModal({ open, onClose, onGenerate }: CharacterSheetModalProps) {
  const [form, setForm] = useState<CharacterSheetFormData>(DEFAULT_FORM_DATA);

  if (!open) return null;

  const update = <K extends keyof CharacterSheetFormData>(
    key: K,
    value: CharacterSheetFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'var(--overlay)' }}
      onClick={onClose}
    >
      <div
        className="glass-1 flex w-full max-w-[792px] flex-col overflow-hidden rounded-card"
        style={{ maxHeight: '88vh', boxShadow: 'var(--shadow-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid var(--stroke-soft)' }}
        >
          <p className="text-content" style={TEXT_HEADING}>
            캐릭터 만들기
          </p>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-content-muted hover:bg-surface-2 hover:text-content"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <FieldRow label="성별">
              <FieldSelect
                value={form.gender}
                options={GENDER_OPTIONS}
                onChange={(v) => update('gender', v)}
              />
            </FieldRow>
            <FieldRow label="나이대">
              <FieldSelect
                value={form.ageGroup}
                options={AGE_GROUP_OPTIONS}
                onChange={(v) => update('ageGroup', v)}
              />
            </FieldRow>
            <FieldRow label="체형">
              <FieldSelect
                value={form.bodyType}
                options={BODY_TYPE_OPTIONS}
                onChange={(v) => update('bodyType', v)}
              />
            </FieldRow>
          </div>

          <Divider />

          <div className="flex flex-col gap-4">
            <FieldRow label="스타일">
              <FieldPillGroup
                value={form.style}
                options={STYLE_OPTIONS}
                onChange={(v) => update('style', v)}
              />
            </FieldRow>
            <FieldRow label="세계관">
              <FieldPillGroup
                value={form.worldSetting}
                options={WORLD_SETTING_OPTIONS}
                onChange={(v) => update('worldSetting', v)}
              />
            </FieldRow>
          </div>

          <Divider />

          <div className="flex flex-col gap-4">
            <FieldRow label="헤어 길이">
              <FieldSelect
                value={form.hairLength}
                options={HAIR_LENGTH_OPTIONS}
                onChange={(v) => update('hairLength', v)}
              />
            </FieldRow>
            <FieldRow label="헤어 스타일">
              <FieldSelect
                value={form.hairStyle}
                options={HAIR_STYLE_OPTIONS}
                onChange={(v) => update('hairStyle', v)}
              />
            </FieldRow>
            <FieldRow label="헤어 색상">
              <ColorField value={form.hairColor} onChange={(v) => update('hairColor', v)} />
            </FieldRow>
          </div>

          <Divider />

          <div className="flex flex-col gap-4">
            <FieldRow label="표정">
              <FieldSelect
                value={form.expression}
                options={EXPRESSION_OPTIONS}
                onChange={(v) => update('expression', v)}
              />
            </FieldRow>
            <FieldRow label="눈 색상">
              <ColorField value={form.eyeColor} onChange={(v) => update('eyeColor', v)} />
            </FieldRow>
          </div>

          <Divider />

          <div className="flex flex-col gap-4">
            <FieldRow label="의상 장르">
              <FieldPillGroup
                value={form.outfitGenre}
                options={OUTFIT_GENRE_OPTIONS}
                onChange={(v) => update('outfitGenre', v)}
              />
            </FieldRow>
            <FieldRow label="의상 색상">
              <ColorField value={form.outfitColor} onChange={(v) => update('outfitColor', v)} />
            </FieldRow>
            <FieldRow label="악세서리">
              <FieldPillGroupMulti
                value={form.accessories}
                options={ACCESSORY_OPTIONS}
                onChange={(v) => update('accessories', v)}
              />
            </FieldRow>
          </div>
        </div>

        <div
          className="flex items-center justify-center gap-3 p-6"
          style={{ borderTop: '1px solid var(--stroke-soft)' }}
        >
          <button
            type="button"
            onClick={() => setForm(DEFAULT_FORM_DATA)}
            className="w-[135px] rounded-chip px-4 py-3"
            style={{
              border: '1px solid var(--content-muted)',
              color: 'var(--content-muted)',
              ...TEXT_BUTTON,
            }}
          >
            초기화
          </button>
          <button
            type="button"
            onClick={() => onGenerate(form)}
            className="w-[135px] rounded-chip px-6 py-3"
            style={{
              background: 'var(--primary-200)',
              color: 'var(--md-on-primary)',
              ...TEXT_BUTTON_STRONG,
            }}
          >
            생성하기
          </button>
        </div>
      </div>
    </div>
  );
}
