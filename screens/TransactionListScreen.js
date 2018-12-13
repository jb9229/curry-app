// @flow
import React from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Picker,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import moment from 'moment';
import { handleJsonResponse, dispatchJsonSuccResponse, dispatchJsonResponse, handleNetworkError } from '../utils/network-common';
import * as api from '../api/api';
import TransListItem from '../components/molecules/TransListItem';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  moveActionModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  moveActionModalWrap: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  searchCommandWarp: {
    flex: 1,
  },
  transListWarp: {
    flex: 5,
  },
  moveAccPicker: {
    width: 190,
    height: 50,
  },
  moveTransModButWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transListTableHeaderRow: {
    flex: 1,
    flexDirection: 'row',
  },
  searchTimeWrap: {
    flex: 1,
    flexDirection: 'row',
  },
  tiSearPeriod: {
    fontSize: 24,
    padding: 5,
    margin: 3,
  },
});

type Props = {
  navigation: Object,
}

type State = {
  inquiryToken: string,
  transactionList: Array<Object>,
  divAccTransList: Array<Object>,
  selMoveDivAccount: Object,
  checkedTransList: Array<Object>,
  moveTransSelMap: Map<string, Object>,
}

const transTestData = JSON.parse(
  '{ "api_tran_id": "2cfc5541-17ab-40c7-b12f-82fde00f7f5f", "rsp_code": "A0000", "rsp_message": " ", "api_tran_dtm": "20160826111428881", "bank_tran_id": "F010226114NIBXQ5FWVG","bank_tran_date": "20160826","bank_code_tran": "097","bank_rsp_code": "000","bank_rsp_message": " ","fintech_use_num": "101600000169321934052424","balance_amt": "500000","page_index_use_yn": "N","page_index": "1","total_record_cnt": "1","page_record_cnt": "1","next_page_yn": "N","res_list": [{"tran_date": "20181207","tran_time": "024111","inout_type": "입금","tran_type": "현금","print_content": "모로코점","tran_amt": "2500","after_balance_amt": "10000000","branch_name": "분당점"},{"tran_date": "20160612","tran_time": "100000","inout_type": "출금","tran_type": "카드","print_content": "식비","tran_amt": "110000","after_balance_amt": "7000000","branch_name": "수원점"}]}',
);
export default class TransactionListScreen extends React.PureComponent<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      inquiryToken: 'Bearer 5a965cd7-0ec3-4312-a7aa-dc8da4838e18',
      transactionList: [],
      divAccTransList: [],
      isVisibleMoveTransModal: false,
      selMoveDivAccount: null,
      moveTransSelMap: (new Map(): Map<string, Object>),
    };
  }

  componentDidMount() {
    this.searchTransList(0, 3);
  }

  /**
   * 거래내역 조회 함수
   *
   * @param {number} monthPeriod 현재로부터 월 조회 기간
   * @param {number} dayPeriod 현재로부터 일 조회 기간
   * @returns null
   */
  searchTransList = async (monthPeriod: number, dayPeriod: number) => {
    const { navigation } = this.props;
    const { divAccTransList } = this.state;
    const { divAccount } = navigation.state.params;

    await this.getDivTransList(monthPeriod, dayPeriod);
    console.log('=============searchTransList================');
    console.log(divAccTransList);
    if (divAccount.isDefault) {
      const oriAccTransList = await this.requestOriAccTransList();// when default divaccount
      const filtDefAccTransList = this.filterDefDivAccTransList(this.filtCondition)(
        oriAccTransList, divAccTransList,
      );

      this.setState({ transactionList: filtDefAccTransList });
    } else {
      this.setState({ transactionList: divAccTransList });
    }
  }

  /**
   * 대표나누기통장 거래내역 필터링 함수
   *
   * @param {function} pred 필터링 조건 함수
   * @param {Array} a 필터링 될 리스트
   * @param {Array} b 필터링 할 리스트
   * @return 필터링 된 리스트
   */
  filterDefDivAccTransList = pred => (a, b) => a.filter(x => !b.some(y => pred(x, y)));

  /**
   * 필터링 조건 함수
   *
   * @param {Array} x 필터링 될 리스트
   * @param {Array} y 필터링 할 리스트
   * @return 필터링 조건
   */
  filtCondition = (x, y) => (x.tran_date === y.tran_date && x.tran_time === y.tran_time
    && x.tran_amt === y.tran_amt && x.after_balance_amt === y.after_balance_amt)

  /**
   * 나누기통장 거래내역 리스트 획득 함수
   *
   * @param {number} monthPeriod 현재로부터 월 조회 기간
   * @param {number} dayPeriod 현재로부터 일 조회 기간
   * @return {Array} 나누기통장 거래내역 리스트
   */
  getDivTransList = (monthPeriod: number, dayPeriod: number) => {
    const { navigation } = this.props;
    const { divAccount, otherDivAccList } = navigation.state.params;

    // 조회 조건 설정
    const fromDate = moment()
      .subtract(monthPeriod, 'months')
      .subtract(dayPeriod, 'days')
      .format('YYYYMMDD');
    const toDate = moment().format('YYYYMMDD');

    const searchDivIds = [];
    if (divAccount.isDefault) {
      otherDivAccList.forEach((account) => {
        searchDivIds.push(account.id);
      });
    } else {
      searchDivIds.push(divAccount.id);
    }

    // 요청
    api.getDivAccTransInfoList(searchDivIds, fromDate, toDate)
      .then(res => dispatchJsonSuccResponse(res, this.successGetDivTransList))
      .catch(handleNetworkError);
  }

  /**
   * 거래내역을 다른 나누기통장으로 옮기기 함수(MoveTransModal창 이동버튼에 의해서만 호출됨)
   */
  moveTransaction = () => {
    const { moveTransSelMap } = this.state;
    const { selMoveDivAccount } = this.state;

    // validation
    if (moveTransSelMap.size === 0) { Alert.alert('옮길 거래내역을 선택 해 주세요.'); return; }

    // make new move list
    const moveList = [];
    moveTransSelMap.forEach((item) => {
      const moveTrans = item;
      moveTrans.divAccId = selMoveDivAccount.id;
      moveList.push(moveTrans);
    });

    // request
    if (selMoveDivAccount.isDefault) {
      this.requestDeleteTransList(moveList);
    } else {
      this.requestSaveOrUpdateTransList(moveList);
    }

    // close modal
    this.setState({ isVisibleMoveTransModal: false });

    // refresh tranaction list
    this.searchTransList(0, 3);
  }

  /**
   * 오픈뱅크서버에 거래내역 리스트 요청 함수
   */
  requestOriAccTransList = () => {
    const { navigation } = this.props;
    const { divAccount } = navigation.state.params;
    const { inquiryToken } = this.state;

    const transList = api.getOpenBankTransList(inquiryToken, divAccount)
      .then(res => dispatchJsonSuccResponse(res, this.successReqOriAccTransList));

    // return transList;
    return transTestData.res_list; // testData
  }

  requestSaveOrUpdateTransList = (tranInfoList: Array<Object>) => {
    api.saveOrUpdateTransInfo(tranInfoList)
      .then(handleJsonResponse);
  };

  requestDeleteTransList = (tranInfoList: Array<Object>) => {
    api.deleteTransInfo(tranInfoList)
      .then(handleJsonResponse);
  };

  successGetDivTransList = (resTransList) => {
    console.log('=============successGetDivTransList===============');
    console.log(resTransList);
    this.setState({ divAccTransList: resTransList });
  }

  successReqOriAccTransList = (resTransInfo) => {
    // validation
    if (resTransInfo == null) {
      return;
    }

    const rspCode = resTransInfo.rsp_code;
    if (rspCode === 'A0000') {
    }

    const transList = resTransInfo.res_list;
  }

  failReqOriAccTransList = () => {
    console.log("failReqOriAccTransList");
  }

  onPressTransItem = (id: string, item: Object) => {
    // updater functions are preferred for transactional updates
    this.setState((state) => {
      // copy the map rather than modifying state.
      const moveTransSelMap = new Map(state.moveTransSelMap);
      const selTransInfo = moveTransSelMap.get(id);

      if (selTransInfo === undefined) {
        moveTransSelMap.set(id, item); // toggle
      } else {
        moveTransSelMap.delete(id); // toggle
      }

      return { moveTransSelMap };
    });
  };

  renderTransListItem = (item, index) => {
    const { moveTransSelMap } = this.state;

    return (
      <TransListItem
        id={index.toString()}
        onPressItem={this.onPressTransItem}
        moveTransSelMap={moveTransSelMap.get(index.toString()) !== undefined}
        item={item}
      />
    );
  }

  render() {
    const { navigation } = this.props;
    const { divAccount, otherDivAccList } = navigation.state.params;
    const {
      transactionList,
      selMoveDivAccount,
      isVisibleMoveTransModal,
      moveTransSelMap,
    } = this.state;

    const otherDivAccPickerItems = otherDivAccList.map(account => (
      <Picker.Item key={account.id} value={account} label={account.description} />
    ));

    return (
      <View style={styles.container}>
        <View style={styles.moveActionModal}>
          <Modal
            animationType="slide"
            transparent
            visible={isVisibleMoveTransModal}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}
          >
            <View style={styles.moveActionModalContainer}>
              <View style={styles.moveActionModalWrap}>
                <Picker
                  selectedValue={selMoveDivAccount}
                  style={styles.moveAccPicker}
                  onValueChange={itemValue => this.setState({ selMoveDivAccount: itemValue })}
                >
                  {otherDivAccPickerItems}
                </Picker>
                <View style={styles.moveTransModButWrap}>
                  <TouchableHighlight
                    onPress={() => this.moveTransaction}
                  >
                    <Text>이동</Text>
                  </TouchableHighlight>

                  <TouchableHighlight
                    onPress={() => {
                      this.setState({ isVisibleMoveTransModal: false });
                    }}
                  >
                    <Text>취소</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        <View style={styles.searchCommandWarp}>
          <Text>{divAccount.description}</Text>
          <TouchableHighlight
            onPress={() => this.setState({ isVisibleMoveTransModal: true })}
          >
            <Text>거내내역 이동</Text>
          </TouchableHighlight>
          <View style={styles.searchTimeWrap}>
            <TouchableHighlight onPress={() => this.searchTransList(0, 1)}>
              <Text style={styles.tiSearPeriod}>1일</Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => this.searchTransList(0, 7)}
            >
              <Text style={styles.tiSearPeriod}>7일</Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => this.searchTransList(1, 0)}
            >
              <Text style={styles.tiSearPeriod}>1달</Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => this.searchTransList(3, 0)}>
              <Text style={styles.tiSearPeriod}>3달</Text>
            </TouchableHighlight>
          </View>
        </View>
        <View style={styles.transListWarp}>
          <View style={styles.transListTableHeaderRow}>
            <Text>날짜</Text>
            <Text>사용처</Text>
            <Text>금액</Text>
            <Text>잔액</Text>
          </View>
          {transactionList.length > 0
            && (
            <FlatList
              data={transactionList}
              extraData={moveTransSelMap}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this.renderTransListItem}
            />
            )}
        </View>
      </View>
    );
  }
}
