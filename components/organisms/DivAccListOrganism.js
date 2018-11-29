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
  contentContainer: {
    paddingTop: 30,
  },
});

type Props = {
  divAccounts: Function,
  createDivAcc: Function,
  deleteDivAcc: Function,
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

  /*
   * Open Add Divide Account Modal
   */
  openAddDivAccModal = () => {
    this.setState({
      isVisibleDivAccFormModal: true,
    });
  };

  setVisibleDivAccFormModal = (visible: boolean) => {
    this.setState({ isVisibleDivAccFormModal: visible });
  };

  createDivAcc = (addDivAccDescription: string, addDivAccBalance: number) => {
    const { createDivAcc } = this.props;

    createDivAcc(addDivAccDescription, addDivAccBalance);

    this.setVisibleDivAccFormModal(false);
  };

  render() {
    const { divAccounts, deleteDivAcc } = this.props;
    const { isVisibleDivAccFormModal } = this.state;

    let defDivAccBalance = -1;

    divAccounts.forEach((divAccount) => {
      if (divAccount.isDefault) {
        defDivAccBalance = divAccount.balance;
      }
    });

    return (
      <View style={styles.divAccountListWrap}>
        {divAccounts.length > 0 && (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.accountList}>
              <FlatList
                data={divAccounts}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <AccountCard
                    isDefault={item.isDefault}
                    balance={item.balance}
                    title={item.description}
                    accId={item.id}
                    deleteAccount={deleteDivAcc}
                  />
                )}
              />
            </View>
            <View>
              <TouchableHighlight onPress={this.openAddDivAccModal}>
                <Text>통장 나누기 추가</Text>
              </TouchableHighlight>
            </View>
          </ScrollView>
        )}
        <DivAccFormModal
          isVisibleDivAccFormModal={isVisibleDivAccFormModal}
          setVisibleDivAccFormModal={this.setVisibleDivAccFormModal}
          createDivAcc={this.createDivAcc}
          defDivAccBalance={defDivAccBalance}
        />
      </View>
    );
  }
}
