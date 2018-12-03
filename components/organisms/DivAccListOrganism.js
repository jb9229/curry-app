// @flow
import React from 'react';
import {
  FlatList, ScrollView, TouchableHighlight, Text, StyleSheet, View,
} from 'react-native';

import AccountCard from './AccountCard';
import DivAccFormModal from './DivAccFormModal';

const styles = StyleSheet.create({
  divAccountListWrap: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divAccListTitleWrap: {
    marginBottom: 10,
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

  render() {
    const {
      divAccList, deleteDivAcc, createDivAcc, navigation,
    } = this.props;
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
          <Text>나누기 통장</Text>
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
                    navigation={navigation}
                  />
                )}
              />
            </View>
            <View>
              <TouchableHighlight onPress={() => this.setVisibleDivAccFormModal(true)}>
                <Text>통장 나누기 추가</Text>
              </TouchableHighlight>
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
