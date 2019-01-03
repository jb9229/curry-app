// @flow
import React from 'react';
import {
  Button, FlatList, ScrollView, Text, StyleSheet, View,
} from 'react-native';

import AccountCard from './AccountCard';
import DivAccFormModal from './DivAccFormModal';
import colors from '../../constants/Colors';

const styles = StyleSheet.create({
  divAccountListWrap: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divAccListTitleWrap: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  divAcclistTitleText: {
    fontSize: 19,
    marginRight: 3,
  },
  accountList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  errorMessage: {
    color: 'red',
  },
  divAccScrollWrap: {},
});

type Props = {
  divAccList: Array<Object>,
  deleteDivAcc: Function,
  createDivAcc: Function,
  navigation: Object,
  fintechUseNum: string,
};

type States = {
  isVisibleDivAccFormModal: boolean,
};

export default class DivAccListOrganism extends React.Component<Props, States> {
  constructor(props: any) {
    super(props);

    this.state = {
      isVisibleDivAccFormModal: false,
    };
  }

  componentDidMount() {}

  /**
   * 나누기 통장 에디터폼 Visible 설정 함수
   * @param {boolean} visible Visible 설정 값
   */
  setVisibleDivAccFormModal = (visible: boolean) => {
    this.setState({ isVisibleDivAccFormModal: visible });
  };

  navigateTransListScreen = (divAccount) => {
    const { navigation, divAccList, fintechUseNum } = this.props;

    const otherDivAccList = [];
    divAccList.forEach((account) => {
      if (account.id !== divAccount.id) {
        otherDivAccList.push(account);
      }
    });

    navigation.navigate('TransList', { divAccount, otherDivAccList, fintechUseNum });
  };

  render() {
    const { divAccList, deleteDivAcc, createDivAcc } = this.props;
    const { isVisibleDivAccFormModal } = this.state;

    let defDivAccBalance = -1;

    divAccList.forEach((divAccount) => {
      if (divAccount.isDefault) {
        defDivAccBalance = divAccount.balance;
      }
    });

    return (
      <View style={styles.divAccountListWrap}>
        <View style={styles.divAccListTitleWrap}>
          <Text style={styles.divAcclistTitleText}>나누기 통장 리스트</Text>
          <Button
            onPress={() => this.setVisibleDivAccFormModal(true)}
            title="추가"
            color={colors.mainColorDark}
            accessibilityLabel="나누기 통장 추가 버튼"
          />
        </View>
        {divAccList.length > 0 && (
          <ScrollView divAccScrollWrapStyle={styles.divAccScrollWrap}>
            <View style={styles.accountList}>
              <FlatList
                data={divAccList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <AccountCard
                    divAccount={item}
                    deleteAccount={deleteDivAcc}
                    navigateTransListScreen={this.navigateTransListScreen}
                  />
                )}
              />
            </View>
          </ScrollView>
        )}
        <DivAccFormModal
          createDivAcc={createDivAcc}
          isVisibleDivAccFormModal={isVisibleDivAccFormModal}
          setVisibleDivAccFormModal={this.setVisibleDivAccFormModal}
          defDivAccBalance={defDivAccBalance}
        />
      </View>
    );
  }
}
