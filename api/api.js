import { Alert } from 'react-native';
import moment from 'moment';
import {
  CURRYSERVER_ORIACCOUNTS,
  CURRYSERVER_DIVACCOUNTS,
  CURRYSERVER_TRANSINFO,
  OPENBANKSERVER_ACCOUNT_BALANCE,
  OPENBANKSERVER_ACCOUNT_TRANSACTIONLIST,
  OPENBANK_TOKEN,
  OPENBANK_USERINFO,
  OPENBANK_ACCOUNT_CANCEL,
} from '../constants/Network';
import { handleJsonResponse, handleOpenBankJsonResponse } from '../utils/network-common';
import openbankInfo from '../constants/OpenBankInfo';
import Exception from '../common/Exception';

/**
 * 접근토큰 요청 함수
 * @param {Object} openBankAuthInfo 토큰정보
 */
function getAccessToken(openBankAuthInfo) {
  const headerAuth = `${openBankAuthInfo.token_type} ${openBankAuthInfo.access_token}`;

  return headerAuth;
}

// ===================== OpenBank Server ===================
/**
 * 사용자 정보조회 요청 API 함수
 * @param {Object} accessTokenInfo 접근 토큰
 * @param {string} userSeqNo 사용자일련번호
 */
export function getUserInfo(accessTokenInfo, userSeqNo) {
  return fetch(`${OPENBANK_USERINFO}?user_seq_no=${encodeURIComponent(userSeqNo)}`, {
    headers: {
      Authorization: getAccessToken(accessTokenInfo),
    },
  })
    .then(handleOpenBankJsonResponse)
    .catch((error) => {
      Alert.alert(
        '오픈뱅크 사용자정보 조회에 문제가 있습니다, 재 시도해 주세요.',
        `[${error.name}] ${error.message}`,
      );

      return undefined;
    });
}

export function refreshOpenBankAuthToken(refreshToken) {
  const paramData = {
    client_id: openbankInfo.client_id,
    client_secret: openbankInfo.secret,
    refresh_token: refreshToken,
    scope: 'login inquiry',
    grant_type: 'refresh_token',
  };

  return fetch(
    `${OPENBANK_TOKEN}?
    client_id=${encodeURIComponent(paramData.client_id)}
    &client_secret=${encodeURIComponent(paramData.client_secret)}
    &refresh_token=${encodeURIComponent(paramData.refresh_token)}
    &scope=${encodeURIComponent(paramData.scope)}
    &grant_type=${encodeURIComponent(paramData.grant_type)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    },
  )
    .then(handleOpenBankJsonResponse)
    .catch((error) => {
      Alert.alert(
        '오픈뱅크 토큰 Refresh 요청에 문제가 있습니다, 재 시도해 주세요.',
        `[${error.name}] ${error.message}`,
      );

      return undefined;
    });
}

/**
 * 계좌해지 api
 * 
 * @param {Object} accessTokenInfo 토큰정보
 * @param {string} fintechUseNum 핀테크이용번호
 */
export function calcelOpenBankAcc(accessTokenInfo, fintechUseNum) {
  const paramData = {
    scope: 'inquiry',
    fintech_use_num: fintechUseNum,
  };

  return fetch(
    `${OPENBANK_ACCOUNT_CANCEL}?
    &scope=${encodeURIComponent(paramData.scope)}
    &fintech_use_num=${encodeURIComponent(paramData.fintech_use_num)}`,
    {
      method: 'POST',
      headers: {
        Authorization: getAccessToken(accessTokenInfo),
        'Content-Type': 'application/json; charset=UTF-8',
      },
    },
  )
    .then(handleOpenBankJsonResponse)
    .catch((error) => {
      Alert.alert(
        '오픈뱅크 계좌 해지 요청에 문제가 있습니다, 재 시도해 주세요.',
        `[${error.name}] ${error.message}`,
      );

      return undefined;
    });
}

/**
 * Curry앱과 사용자 간의 연결 해제 API
 *
 * @param {Object} accessTokenInfo 토큰정보
 * @param {string} fintechUseNum 핀테크이용번호
 */
export function unlinkOpenBankAcc(accessTokenInfo) {
  const paramData = {
    client_use_code: openbankInfo.client_use_code,
    user_seq_no: accessTokenInfo.user_seq_no,
  };

  return fetch(
    `${OPENBANK_ACCOUNT_CANCEL}?
    &client_use_code=${encodeURIComponent(paramData.client_use_code)}
    &user_seq_no=${encodeURIComponent(paramData.user_seq_no)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    },
  )
    .then(handleOpenBankJsonResponse)
    .catch((error) => {
      Alert.alert(
        '오픈뱅크 Curry앱과 사용자 간의 연결 해제 요청에 문제가 있습니다, 재 시도해 주세요.',
        `[${error.name}] ${error.message}`,
      );

      return undefined;
    });
}

/**
 * 등록된 계좌목록 조회 함수
 * @param {Object} accessTokenInfo 접근 토큰
 * @param {string} userSeqNo 사용자일련번호
 * @param {string} isInclCancAccount 해지계좌포함여부 (Y:해지계좌포함, N:해지계좌불포함)
 * @param {string} sort 정렬순서 (D:Descending, A:Ascending)
 */
export function getAccountList(accessTokenInfo, userSeqNo, isInclCancAccount, sort) {
  return fetch(
    `${OPENBANK_USERINFO}?user_seq_no=${encodeURIComponent(userSeqNo)}
    &include_cancel_yn=${encodeURIComponent(isInclCancAccount)}
    &sort_order=${encodeURIComponent(sort)}`,
    {
      headers: {
        Authorization: getAccessToken(accessTokenInfo),
      },
    },
  )
    .then(handleOpenBankJsonResponse)
    .catch((error) => {
      Alert.alert(
        '오픈뱅크 계좌목록 조회에 문제가 있습니다, 재 시도해 주세요.',
        `[${error.name}] ${error.message}`,
      );

      return undefined;
    });
}

/**
 * 원통장 잔액 오픈은행서버에 요청 함수
 * @returns null
 */
export function getOpenBankAccBalance(accessTokenInfo, fintechUseNum, succFunction, failFunction) {
  // Set Params
  const paramData = {
    fintechUseNum,
    tran_dtime: moment().format('YYYYMMDDHHmmss'),
  };

  // Request Account Balance API
  return fetch(
    `${OPENBANKSERVER_ACCOUNT_BALANCE}?fintech_use_num=${encodeURIComponent(
      paramData.fintechUseNum,
    )}&tran_dtime=${encodeURIComponent(paramData.tran_dtime)}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: getAccessToken(accessTokenInfo),
      },
    },
  )
    .then(handleOpenBankJsonResponse)
    .then((balanceData) => {
      if (succFunction !== undefined) {
        succFunction(balanceData);
      }

      const balanceStr = balanceData.balance_amt;
      const balance = parseInt(balanceStr, 10);

      return balance;
    })
    .catch((error) => {
      Alert.alert(
        '오픈뱅크 정보요청에 문제가 있습니다, 재 시도해 주세요.',
        `[${error.name}] ${error.message}`,
      );

      if (failFunction != null) {
        failFunction();
      }

      return undefined;
    });
}

export function getOpenBankTransList(inquiryToken, divAccount) {
  const paramData = {
    // Default 1일 조회
    fintechUseNum: divAccount.fintechUseNum,
    from_date: '20181203090000',
    to_date: '20181203100000',
    sort_order: 'D', // 정렬순서(D:Descending, A:Ascending)
    page_index: '1', // 페이지번호

    tran_dtime: moment().format('YYYYMMDDHHmmss'), // 요청일시
    befor_inquiry_trace_info: '', // 직전 조회 추적 정보 (옵션?)
    list_tran_seqno: '', // 최종 거래내역 순번(옵션?)
  };

  return fetch(
    `${OPENBANKSERVER_ACCOUNT_TRANSACTIONLIST}?
      fintechUseNum=${encodeURIComponent(paramData.fintechUseNum)}
      &from_date=${encodeURIComponent(paramData.from_date)}
      &to_date=${encodeURIComponent(paramData.to_date)}
      &sort_order=${encodeURIComponent(paramData.sort_order)}
      &page_index=${encodeURIComponent(paramData.page_index)}
      &tran_dtime=${encodeURIComponent(paramData.tran_dtime)}
      `,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: inquiryToken,
      },
    },
  );
}

// ================ Curry Server ==============
export function createOriAcc(userId, description, fintechUseNum, defDivaccDescription) {
  return fetch(`${CURRYSERVER_ORIACCOUNTS}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      description,
      fintechUseNum,
      defDivaccDescription,
    }),
  })
    .then(handleJsonResponse)
    .catch((error) => {
      Alert.alert('원통장 생성 요청 실패, 통신상태 확인 후 다시 시도해 주세요.', error.message);
      return undefined;
    });
}

/**
 * 커리서버에 나누기 통장추가 요청 함수
 * @param {number} oriAccId 생성할 나누기통장의 원통장 아이디
 * @param {string} description 생성할 나누기통장 별칭
 * @param {number} balance 생성할 나누기통장 잔액
 * @returns Promise
 */
export function createDivAcc(oriAccId, description, balance) {
  return fetch(`${CURRYSERVER_DIVACCOUNTS}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oriAccountId: oriAccId,
      description,
      balance,
    }),
  })
    .then(handleJsonResponse)
    .then(() => true)
    .catch((error) => {
      Alert.alert('나누기통장 생성 요청 실패, 통신상태 확인 후 다시 시도해 주세요.', error.message);
      return false;
    });
}

/**
 * 나누기 통장 삭제 함수
 *  1. 나누기 통장 서버 Data 삭제
 *  2. 나누기 통장 Refresh
 *
 * @param {number} divAccId: 나누기 통장 Server Data Id
 * @returns null
 */
export function deleteDivAcc(divAccId) {
  return fetch(`${CURRYSERVER_DIVACCOUNTS}${divAccId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })
    .then(handleJsonResponse)
    .catch((error) => {
      Alert.alert('handleLoadingError', error.message);
      return false;
    });
}

/**
 * 원통장 리스트 요청
 *
 * @param userID 사용자 아이디
 * @returns null
 */
export function getOriAccList(userId) {
  return fetch(`${CURRYSERVER_ORIACCOUNTS}${userId}`)
    .then(handleJsonResponse)
    .catch((error) => {
      throw error;
    });
}

/**
 * 나누기통장 리스트 커리서버에 요청 함수
 * @param oriAccID 원통장 아이디
 * @returns null
 */
export function getDivAccList(oriAccID) {
  return fetch(`${CURRYSERVER_DIVACCOUNTS}${oriAccID}`).then(handleJsonResponse);
}

/**
 * 나누기통장 리스트 커리서버에 요청 함수
 * @param divAccIDs 원통장 아이디
 * @returns null
 */
export function getDivAccTransInfoList(divAccIDs, transFromDate, transToDate) {
  const paramData = {
    transFromDate,
    transToDate,
  };

  return fetch(
    `${CURRYSERVER_TRANSINFO}/${divAccIDs}?transFromDate=${encodeURIComponent(
      paramData.transFromDate,
    )}&transToDate=${encodeURIComponent(paramData.transToDate)}`,
  );
}

/**
 * 나누기통장 거래내역 삭제(= 대표나누기통장으로 이동) 함수
 * @param {Array} tranInfoList 삭제 할 거래내역 리스트
 */
export function deleteTransInfo(tranInfoList) {
  return fetch(`${CURRYSERVER_TRANSINFO}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(tranInfoList),
  });
}

/**
 * 나누기 통장 거래내역 생성 또는 업데이트 함수
 * @param {Array} tranInfoList 생성 또는 업데이트할 거래내역 리스트
 */
export function saveOrUpdateTransInfo(tranInfoList) {
  return fetch(`${CURRYSERVER_TRANSINFO}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(tranInfoList),
  });
}
