import type { NavigateFunction } from 'react-router-dom';

export function confirmLogin(navigate: NavigateFunction) {
  if (window.confirm('로그인이 필요한 기능입니다. 로그인하시겠어요?')) {
    navigate('/login');
  }
}
