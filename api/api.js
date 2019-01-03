import { Alert } from 'react-native';
import moment from 'moment';
import {
  CURRYSERVER_ORIACCOUNTS,
  CURRYSERVER_DIVACCOUNTS,
  CURRYSERVER_TRANSINFO,
  OPENBANKSERVER_ACCOUNT_BALANCE,
  OPENBANKSERVER_ACCOUNT_TRANSACTIONLIST,
} from '../constants/Network';
import { handleJsonResponse } from '../utils/network-common';

// ================ OpenBank Server ==============

/**
 * 원통장 잔액 오픈은행서버에 요청 함수
 * @returns null
 */
export function getOpenBankAccBalance(inquiryToken, fintechUseNum, succFunction, failFunction) {
  // valiation

  const paramData = {
    fintechUseNum,
    tran_dtime: moment().format('YYYYMMDDHHmmss'),
  };

  return fetch(
    `${OPENBANKSERVER_ACCOUNT_BALANCE}?fintech_use_num=${encodeURIComponent(
      paramData.fintechUseNum,
    )}&tran_dtime=${encodeURIComponent(paramData.tran_dtime)}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: inquiryToken,
      },
    },
  )
    .then(handleJsonResponse)
    .then((responseJson) => {
      if (succFunction !== undefined) {
        succFunction(responseJson);
      }

      // const rspCode = responseJson.rsp_code;
      // if (rspCode === 'A0000') {
      // balance: responseJson.balance_amt,
      // date: responseJson.bank_tran_date,
      // bank: responseJson.bank_code_tran,
      // }

      // const balanceStr = responseJson.balance_amt;
      // const balance = parseInt(balanceStr, 10);
      // return balance;
      return 100000; // Test Code
    })
    .catch((error) => {
      Alert.alert(
        '나누기통장 잔액리스트 요청 실패, 통신상태 확인 후 다시 시도해 주세요\n(반복 실패시 문제현상 리포트 해주시면 신속히 조치 하겠습니다)',
        error.message,
      );

      if (failFunction != null) {
        failFunction();
      }

      // return undefined;
      return 100000; // Test Code
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
/**
 * 커리서버에 나누기 통장추가 요청 함수
 * @param {number} oriAccId 생성할 나누기통장의 원통장 아이디
 * @param {string} description 생성할 나누기통장 별칭
 * @param {number} balance 생성할 나누기통장 잔액
 * @returns Promise
 */
export function creaDivAcc(oriAccId, description, balance) {
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
  return fetch(`${CURRYSERVER_DIVACCOUNTS}${oriAccID}`)
    .then(handleJsonResponse);
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
