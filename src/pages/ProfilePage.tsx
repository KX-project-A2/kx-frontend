import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Check,
  Images,
  Pencil,
  Sparkles,
  Trash2,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import { Button, Panel } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
  deleteAccount,
  deleteProfileImage,
  fetchGenerationSummary,
  updateNickname,
  uploadProfileImage,
  type GenerationSummary,
} from '@/services/me';
import { formatDate } from '@/utils/formatDate';
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
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(profile?.nickname ?? '');
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [summary, setSummary] = useState<GenerationSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const runSummaryFetch = () => {
    fetchGenerationSummary()
      .then(setSummary)
      .catch(() => setSummaryError('생성 활동 정보를 불러오지 못했어요.'))
      .finally(() => setIsSummaryLoading(false));
  };

  const loadSummary = () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    runSummaryFetch();
  };

  useEffect(() => {
    runSummaryFetch();
  }, []);

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

  const handleSaveNickname = async () => {
    if (isNicknameEmpty) return;

    if (trimmedNickname === profile.nickname) {
      setIsEditingNickname(false);
      return;
    }

    setIsSavingNickname(true);
    setProfileError(null);
    try {
      const updated = await updateNickname(trimmedNickname);
      setAuthenticated(updated);
      setIsEditingNickname(false);
    } catch {
      setProfileError('닉네임 변경에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handleCancelNickname = () => {
    setNicknameInput(profile.nickname);
    setIsEditingNickname(false);
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

  const STAT_ITEMS = summary
    ? [
        { label: '전체 생성물', value: summary.totalMediaCount, icon: Sparkles, libraryTab: 'all' },
        { label: '이미지', value: summary.imageCount, icon: Images, libraryTab: 'image' },
        { label: '영상', value: summary.videoCount, icon: VideoIcon, libraryTab: 'video' },
      ]
    : [];

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-8 py-12">
      <h1 className="text-h1-section text-content">내 프로필</h1>

      {profileError && <ErrorMessage message={profileError} />}

      <Panel level={2} className="flex items-center gap-5 p-6">
        <div className="group relative h-24 w-24 shrink-0">
          <img
            src={profile.profileImageUrl || DEFAULT_AVATAR}
            alt=""
            className="h-24 w-24 rounded-full object-cover"
            style={{ border: '1px solid var(--stroke-strong)' }}
          />
          <button
            type="button"
            aria-label="프로필 사진 변경"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
          >
            {isUploadingImage ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Camera size={20} className="text-white" strokeWidth={2} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {profile.profileImageUrl && (
            <button
              type="button"
              aria-label="프로필 사진 삭제"
              disabled={isUploadingImage}
              onClick={handleDeleteImage}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:brightness-110 disabled:cursor-not-allowed"
              style={{ background: 'var(--surface-3)', border: '1px solid var(--stroke-strong)' }}
            >
              <Trash2 size={13} strokeWidth={2} className="text-danger" />
            </button>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {isEditingNickname ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nicknameInput}
                  maxLength={50}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNickname();
                    if (e.key === 'Escape') handleCancelNickname();
                  }}
                  className="h-9 min-w-0 flex-1 rounded-field px-3 text-title text-content outline-none"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--stroke-strong)',
                  }}
                />
                <button
                  type="button"
                  aria-label="저장"
                  disabled={isSavingNickname || isNicknameEmpty}
                  onClick={handleSaveNickname}
                  className="text-brand-light transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSavingNickname ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Check size={18} strokeWidth={2} />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="취소"
                  disabled={isSavingNickname}
                  onClick={handleCancelNickname}
                  className="text-content-muted transition-colors hover:text-content disabled:cursor-not-allowed"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
              {isNicknameEmpty && (
                <span className="text-caption text-danger">닉네임을 입력해주세요.</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="truncate text-title text-content">{profile.nickname}</span>
              <button
                type="button"
                aria-label="닉네임 수정"
                onClick={() => setIsEditingNickname(true)}
                className="shrink-0 text-content-muted transition-colors hover:text-content"
              >
                <Pencil size={15} strokeWidth={2} />
              </button>
            </div>
          )}
          <span className="truncate text-body text-content-secondary">{profile.email}</span>
        </div>
      </Panel>

      <Panel level={2} className="flex flex-col gap-4 p-6">
        <h2 className="text-h2 text-content">생성 활동</h2>

        {isSummaryLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        ) : summaryError ? (
          <ErrorMessage message={summaryError} onRetry={loadSummary} />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              {STAT_ITEMS.map(({ label, value, icon: Icon, libraryTab }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate('/library', { state: { tab: libraryTab } })}
                  className="flex flex-col gap-2 rounded-field p-4 text-left transition-colors hover:bg-surface-3"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--stroke-soft)' }}
                >
                  <Icon size={16} strokeWidth={2} className="text-content-muted" />
                  <span className="font-num text-h2 text-content">{value.toLocaleString()}</span>
                  <span className="text-caption text-content-secondary">{label}</span>
                </button>
              ))}
            </div>
            <span className="text-caption text-content-muted">
              최근 생성일 ·{' '}
              {summary?.latestGeneratedAt
                ? formatDate(summary.latestGeneratedAt)
                : '생성 이력 없음'}
            </span>
          </>
        )}
      </Panel>

      <Panel
        level={2}
        className="flex items-center justify-between gap-4 p-6"
        style={{ border: '1px solid rgba(248,113,113,0.3)' }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-body-medium text-content">회원 탈퇴</span>
          <span className="text-caption text-content-secondary">
            계정과 모든 데이터가 영구적으로 삭제되며 되돌릴 수 없어요.
          </span>
        </div>
        <Button
          variant="secondary"
          disabled={isDeletingAccount}
          onClick={handleDeleteAccount}
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
        >
          {isDeletingAccount ? <LoadingSpinner size="sm" /> : '회원 탈퇴'}
        </Button>
      </Panel>
    </div>
  );
}
