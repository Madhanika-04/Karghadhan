
import { t } from 'i18next';
import MD5 from 'crypto-js/md5';

export function tData(englishString: string): string {
  if (!englishString || typeof englishString !== 'string') return englishString;
  const hash = MD5(englishString).toString().substring(0, 10);
  // data namespace, fallback to englishString
  return t('data:' + hash, englishString);
}
  