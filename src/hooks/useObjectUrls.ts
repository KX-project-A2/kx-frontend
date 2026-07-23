import { useEffect, useState } from 'react';

/** File 배열로 blob URL을 생성하고, 배열이 바뀌거나 언마운트될 때 이전 URL을 해제 */
export function useObjectUrls(files: File[]): string[] {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const nextUrls = files.map((file) => URL.createObjectURL(file));
    setUrls(nextUrls);

    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  return urls;
}
