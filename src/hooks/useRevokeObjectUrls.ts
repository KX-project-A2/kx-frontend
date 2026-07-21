import { useEffect, useRef } from 'react';

/** urls 배열의 최신 값을 추적하다가, 컴포넌트 언마운트 시 그 시점에 들고 있던 blob URL을 모두 해제 */
export function useRevokeObjectUrls(urls: string[]) {
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, []);
}
