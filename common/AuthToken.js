import { AsyncStorage, Alert } from 'react-native';
import * as api from '../api/api';
import PKey from '../constants/Persistkey';

/**
 * 토큰 정보 앱스토리지에 저장 함수
 * @param {Object} tokenInfo 토큰 정보
 */
export async function saveOpenBankAuthInfo(tokenInfoStr) {
  try {
    await AsyncStorage.setItem(PKey.PKEY_OPENBANKAUTHTOKEN, tokenInfoStr);
  } catch (error) {
    Alert.alert(error.name, error.message);
    return false;
  }

  return true;
}

/**
 * 토큰 재인증
 * @param {string} currentDateTime 현재시간
 * @param {Object} openBankAuthInfo 토큰정보
 */
export async function reAuthToken(currentDateTime, openBankAuthInfo) {
  const refreshTokenExpireTime = openBankAuthInfo.expires_in + 1000 * 60 * 60 * 24 * 10;

  if (currentDateTime > refreshTokenExpireTime) {
    // refresh 토큰 만료시 재인증

    return undefined;
  }
  // refresh 토큰으로 Token 재 발급
  const newOpenBankAuthInfo = await api.refreshOpenBankAuthToken(openBankAuthInfo.refresh_token);

  saveOpenBankAuthInfo(newOpenBankAuthInfo);

  return newOpenBankAuthInfo;
}

/**
 * 오픈뱅크 접속 토큰정보 요청 함수
 */
export async function getOpenBankAuthInfo() {
  try {
    const openBankAuthInfoStr = await AsyncStorage.getItem(PKey.PKEY_OPENBANKAUTHTOKEN);
    console.log('=== AsyncStorage openBankAuthInfoStr ===');
    console.log(openBankAuthInfoStr);

    if (openBankAuthInfoStr != null && openBankAuthInfoStr !== '') {
      const openBankAuthInfo = JSON.parse(openBankAuthInfoStr);

      const acessTokenExpireTime = openBankAuthInfo.expires_in;
      const currentDateTime = new Date().getMilliseconds();

      console.log(`openBankAuthInfo Time: ${currentDateTime} / ${acessTokenExpireTime}`);

      if (currentDateTime > acessTokenExpireTime) {
        const newOpenBankAuthInfo = reAuthToken(currentDateTime, openBankAuthInfo);

        return newOpenBankAuthInfo;
      }

      return openBankAuthInfo;
    }
  } catch (error) {
    Alert.alert('getInquiryToken', error.message);
  }

  return undefined;
}
