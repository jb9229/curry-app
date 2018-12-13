import moment from 'moment';
import {
  CURRYSERVER_TRANSINFO,
  OPENBANKSERVER_ACCOUNT_TRANSACTIONLIST,
} from '../constants/Network';

export function getOpenBankTransList(inquiryToken, divAccount) {
  const paramData = {
    // Default 1일 조회
    fintech_use_num: divAccount.fintech_use_num,
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
      fintech_use_num=${encodeURIComponent(paramData.fintech_use_num)}
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

/**
 * 나누기통장 리스트 커리서버에 요청 함수
 * @param divAccIDs 원통장 아이디
 * @returns null
 */
export function getDivAccTransInfoList(
  divAccIDs: Array,
  transFromDate: string,
  transToDate: string,
) {
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
