import { AsyncStorage, Alert } from 'react-native';
import * as api from '../api/api';
import PKey from '../constants/Persistkey';

export async function reAuthToken(currentDateTime, openBankAuthInfo) {
  const refreshTokenExpireTime = openBankAuthInfo.expires_in + 1000 * 60 * 60 * 24 * 10;

  if (currentDateTime > refreshTokenExpireTime) {
    // refresh 토큰 만료시 재인증
    this.props.navigation.navigate('OpenBankAuth', { type: 'REAUTH' });

    return undefined;
  }
  // refresh 토큰으로 Token 재 발급
  const response = await api.refreshOpenBankAuthToken(openBankAuthInfo.refresh_token).then();

  const newOpenBankAuthInfo = response.text().then(text => text);

  return newOpenBankAuthInfo;
}

/**
 * 오픈뱅크 AuthToken 유효기간 체크 함수
 */
export async function getOpenBakAuthInfo() {
  try {
    console.log(`getOpenBakAuthInfo Start: ${PKey.PKEY_OPENBANKAUTHTOKEN}`);
    const keys = await AsyncStorage.getAllKeys((err, inKeys) => {
      console.log(`key/value: ${inKeys} / ?`);
    });
    console.log(`getAllKeys: ${keys}`);
    keys.forEach(async (inKey) => {
      const value = await AsyncStorage.getItem(inKey);

      console.log(`key/value: ${inKey} / ${value}`);
    });

    const openBankAuthInfo = await AsyncStorage.getItem(PKey.PKEY_OPENBANKAUTHTOKEN);
    console.log('=== AsyncStorage openBankAuthInfo ===');
    console.log(openBankAuthInfo);

    if (openBankAuthInfo != null && openBankAuthInfo !== '') {
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
