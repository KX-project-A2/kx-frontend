interface PollJobOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

interface PollJobResponse<T> {
  status: string;
  data?: T;
}

export function pollJob<T>(
  checkFn: () => Promise<PollJobResponse<T>>,
  options?: PollJobOptions
): Promise<T> {
  const intervalMs = options?.intervalMs ?? 2000;
  const timeoutMs = options?.timeoutMs ?? 60000;
  const startedAt = Date.now();

  return new Promise<T>((resolve, reject) => {
    const tick = async () => {
      try {
        const { status, data } = await checkFn();

        if (status === 'SUCCESS' || status === 'COMPLETED') {
          resolve(data as T);
          return;
        }

        if (status === 'FAILED') {
          reject(new Error(`폴링 실패: status=${status}`));
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
