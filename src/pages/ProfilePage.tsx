import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import LegalModal, { type LegalKind } from '@/components/common/LegalModal';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
  deleteAccount,
  deleteProfileImage,
  updateNickname,
  uploadProfileImage,
} from '@/services/me';
import { validateImageFile } from '@/utils/validateImageFile';

const DEFAULT_AVATAR = '/assets/profile/mock-avatar.png';
const PROFILE_IMAGE_MAX_MB = 10;

export default function ProfilePage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(profile?.nickname ?? '');
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [legal, setLegal] = useState<LegalKind | null>(null);

  if (!profile) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setProfileError(null);
    const validation = await validateImageFile(file, PROFILE_IMAGE_MAX_MB);
    if (!validation.valid) {
      setProfileError(validation.reason);
      return;
    }

    setIsUploadingImage(true);
    try {
      const updated = await uploadProfileImage(file);
      setAuthenticated(updated);
    } catch {
      setProfileError('프로필 사진 변경에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    setIsUploadingImage(true);
    setProfileError(null);
    try {
      const updated = await deleteProfileImage();
      setAuthenticated(updated);
    } catch {
      setProfileError('프로필 사진 삭제에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const trimmedNickname = nicknameInput.trim();
  const isNicknameEmpty = trimmedNickname.length === 0;
  const isNicknameUnchanged = trimmedNickname === profile.nickname;

  const handleSaveNickname = async () => {
    if (isNicknameEmpty || isNicknameUnchanged) return;

    setIsSavingNickname(true);
    setProfileError(null);
    try {
      const updated = await updateNickname(trimmedNickname);
      setAuthenticated(updated);
    } catch {
      setProfileError('닉네임 변경에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        '정말로 회원 탈퇴를 진행할까요? 계정과 모든 데이터가 영구적으로 삭제되며, 되돌릴 수 없어요.'
      )
    ) {
      return;
    }

    setIsDeletingAccount(true);
    setProfileError(null);
    try {
      await deleteAccount();
      setUnauthenticated();
      navigate('/login', { replace: true });
    } catch {
      setProfileError('회원 탈퇴에 실패했어요. 다시 시도해주세요.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-8 py-12">
      <h1 className="text-h1-section text-content">내 프로필</h1>

      {profileError && <ErrorMessage message={profileError} />}

      {/* 프로필 */}
      <div className="flex w-full flex-col gap-5 rounded-[20px] border border-white/7 bg-surface-1 p-8">
        <h2 className="text-h3 text-[#f5f5f5]">프로필</h2>
        <div className="flex w-full items-center gap-8">
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-full">
              <img
                src={profile.profileImageUrl || DEFAULT_AVATAR}
                alt=""
                className="h-full w-full object-cover"
              />
              {profile.profileImageUrl && (
                <button
                  type="button"
                  aria-label="프로필 사진 삭제"
                  disabled={isUploadingImage}
                  onClick={handleDeleteImage}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 transition-colors hover:brightness-110 disabled:cursor-not-allowed"
                  style={{ border: '1px solid var(--stroke-strong)' }}
                >
                  <Trash2 size={13} strokeWidth={2} className="text-[#ff5252]" />
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[6px] bg-surface-3 px-3 py-1.5 text-[12px] font-medium text-primary-200 transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isUploadingImage ? <LoadingSpinner size="sm" /> : '이미지 변경'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex w-full items-end gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label htmlFor="studio-name" className="text-body text-content-secondary">
                  스튜디오 이름
                </label>
                <input
                  id="studio-name"
                  value={nicknameInput}
                  maxLength={50}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNickname();
                  }}
                  className="h-11 w-full rounded-[8px] bg-[rgba(21,18,24,0.8)] px-3 text-[16px] text-[#f5f5f5] outline-none"
                  style={{ border: '1px solid var(--surface-3)' }}
                />
              </div>
              <button
                type="button"
                disabled={isSavingNickname || isNicknameEmpty || isNicknameUnchanged}
                onClick={handleSaveNickname}
                className="flex h-11 shrink-0 items-center justify-center rounded-[8px] bg-primary-300 px-6 text-[14px] font-bold text-[#4d0071] transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSavingNickname ? <LoadingSpinner size="sm" /> : '저장'}
              </button>
            </div>
            {isNicknameEmpty && (
              <span className="text-caption text-danger">닉네임을 입력해주세요.</span>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-content-muted">이메일 주소</span>
              <span className="text-[16px] font-medium text-[#d6d6d6]">{profile.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 활동 */}
      <div className="flex w-full flex-col gap-5 rounded-[20px] border border-white/7 bg-surface-1 p-8">
        <h2 className="text-h3 text-[#f5f5f5]">활동</h2>
        <div className="flex w-full items-center justify-between gap-5 rounded-[12px] bg-surface-3 p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-[16px] font-bold text-[#f5f5f5]">내 생성 이력</span>
            <span className="text-[13px] text-content-muted">
              지금까지 생성한 AI 이미지와 비디오를 라이브러리에서 한눈에 확인하고 영구 보관할 수
              있습니다.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/library')}
            className="shrink-0 rounded-full border border-white/10 bg-surface-1 px-5 py-2.5 text-[13px] font-bold text-primary-300 transition-colors hover:brightness-110"
          >
            라이브러리로 이동
          </button>
        </div>
      </div>

      {/* 위험 구역 */}
      <div className="flex w-full flex-col gap-5 rounded-[20px] border border-[rgba(255,82,82,0.18)] bg-surface-1 p-8">
        <h2 className="text-h3 text-[#ff5252]">위험 구역 (Account Deletion)</h2>
        <div className="h-px w-full bg-white/7" />
        <div className="flex w-full items-center justify-between gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-[16px] font-bold text-[#f5f5f5]">회원 탈퇴</span>
            <span className="text-[13px] text-content-muted">
              계정과 함께 라이브러리에 저장된 모든 생성 이미지/동영상 에셋이 즉시 영구 삭제되며, 이
              작업은 취소할 수 없습니다.
            </span>
          </div>
          <button
            type="button"
            disabled={isDeletingAccount}
            onClick={handleDeleteAccount}
            className="flex shrink-0 items-center justify-center rounded-[8px] border border-[rgba(255,82,82,0.5)] bg-[rgba(255,82,82,0.1)] px-6 py-3 text-[14px] font-bold text-[#ff5252] transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeletingAccount ? <LoadingSpinner size="sm" /> : '계정 삭제'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 pt-6">
        <button
          type="button"
          onClick={() => setLegal('terms')}
          className="text-[13px] text-[#757575] transition-colors hover:text-content-secondary"
        >
          이용약관
        </button>
        <span className="h-3 w-px bg-[#757575]" />
        <button
          type="button"
          onClick={() => setLegal('privacy')}
          className="text-[13px] text-[#757575] transition-colors hover:text-content-secondary"
        >
          개인정보 처리방침
        </button>
        <span className="h-3 w-px bg-[#757575]" />
        <span className="text-[13px] text-[#757575]">© 2026 GeNova. All rights reserved.</span>
      </div>

      <LegalModal kind={legal} onClose={() => setLegal(null)} />
    </div>
  );
}
