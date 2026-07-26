export class JobFailedError extends Error {
  jobId: number;

  constructor(message: string, jobId: number) {
    super(message);
    this.name = 'JobFailedError';
    this.jobId = jobId;
  }
}

interface PollJobOptions {
  jobId: number;
  intervalMs?: number;
  timeoutMs?: number;
}

interface PollJobResponse<T> {
  status: string;
  data?: T;
  errorMessage?: string;
}

export function pollJob<T>(
  checkFn: () => Promise<PollJobResponse<T>>,
  options: PollJobOptions
): Promise<T> {
  const { jobId } = options;
  const intervalMs = options.intervalMs ?? 2000;
  const timeoutMs = options.timeoutMs ?? 60000;
  const startedAt = Date.now();

  return new Promise<T>((resolve, reject) => {
    const tick = async () => {
      try {
        const { status, data, errorMessage } = await checkFn();

        if (status === 'SUCCESS' || status === 'COMPLETED') {
          resolve(data as T);
          return;
        }

        if (status === 'FAILED' || status === 'CANCELED') {
          reject(
            new JobFailedError(errorMessage || '생성에 실패했어요. 다시 시도해주세요.', jobId)
          );
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error('폴링 타임아웃'));
          return;
        }

        setTimeout(tick, intervalMs);
      } catch (error) {
        reject(error);
      }
    };

    tick();
  });
}
