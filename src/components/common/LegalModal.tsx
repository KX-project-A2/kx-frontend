import { X } from 'lucide-react';
import { Button } from '@/components/common/ui';

export type LegalKind = 'terms' | 'privacy';

interface LegalModalProps {
  kind: LegalKind | null;
  onClose: () => void;
}

const CONTENT: Record<LegalKind, { title: string; sections: string[] }> = {
  terms: {
    title: '이용약관',
    sections: [
      '제1조 (목적) 본 약관은 Lumina(이하 "회사")가 제공하는 AI 이미지·영상 생성 서비스의 이용 조건 및 절차, 이용자와 회사의 권리·의무를 규정함을 목적으로 합니다.',
      '제2조 (생성 결과물) 이용자가 서비스를 통해 생성한 결과물의 이용 권한은 관련 법령 및 회사 정책에 따릅니다.',
      '제3조 (금지 행위) 타인의 권리를 침해하거나 불법적인 콘텐츠를 생성하는 행위를 금합니다.',
    ],
  },
  privacy: {
    title: '개인정보 처리방침',
    sections: [
      '1. 수집 항목 — 회사는 회원가입 시 이메일 주소와 비밀번호를 수집합니다.',
      '2. 이용 목적 — 수집된 정보는 서비스 제공, 본인 확인, 고객 문의 대응을 위해 사용됩니다.',
      '3. 보관 및 파기 — 회원 탈퇴 시 관련 법령에 따른 보관 기간을 제외하고 지체 없이 파기합니다.',
    ],
  },
};

export default function LegalModal({ kind, onClose }: LegalModalProps) {
  if (!kind) return null;

  const { title, sections } = CONTENT[kind];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="glass-2 relative w-full max-w-md rounded-card p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 text-content-muted transition-colors hover:text-content"
        >
          <X size={20} />
        </button>

        <h2 className="text-h2 text-content">{title}</h2>

        <div className="mt-4 flex flex-col gap-3 text-body text-content-secondary">
          {sections.map((section) => (
            <p key={section}>{section}</p>
          ))}
        </div>

        <Button variant="primary" size="lg" block onClick={onClose} className="mt-6">
          확인
        </Button>
      </div>
    </div>
  );
}
