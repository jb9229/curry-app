import React from 'react';
import {
  Alert,
  AsyncStorage,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
  TouchableHighlight,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import AccountCard from './AccountCard';
import DivAccFormModal from './DivAccFormModal';
import { CURRYSERVER_DIVACCOUNTS } from '../../constants/Network';

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

export default class DivAccListOrganism extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isVisibleOriAccForm: false,
    };
  }

  componentDidMount() {}

  /*
   * Open Add Divide Account Modal
   */
  openAddDivAccModal = () => {
    this.setState({
      isVisibleOriAccForm: true,
    });
  };

  setOriAccFormModalVisible = (visible) => {
    this.setState({ isVisibleOriAccForm: visible });
  };

  creaDivAccount = (addDivAccDescription, addDivAccBalance) => {
    this.requestCreaDivAccount(addDivAccDescription, addDivAccBalance);

    this.setOriAccFormModalVisible(false);
  };

  requestCreaDivAccount = async (addDivAccDescription, addDivAccBalance) => {
    const { oriAccount } = this.props;

    await fetch(`${CURRYSERVER_DIVACCOUNTS}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oriAccountId: oriAccount.id,
        description: addDivAccDescription,
        balance: addDivAccBalance,
      }),
    })
      .then(response => response.json())
      .then((responseJson) => {
        this.props.addDivAccount(responseJson);
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  };

  render() {
    const { divAccounts, isEmptyDivAcc } = this.props;
    const { isVisibleOriAccForm } = this.state;

    const defaultAccountBalance = divAccounts.map((divAccount, index) => {
      if (divAccount.isDefault) {
        return divAccount.balance;
      }
    });
    return (
      <View style={styles.divAccountListWrap}>
        {isEmptyDivAcc === undefined && (
          <View>
            <Text>쪼갠 통장 로딩 중....</Text>
          </View>
        )}

        {isEmptyDivAcc !== undefined
          && !isEmptyDivAcc && (
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
                      deleteAccount={this.deleteDivAccount}
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
          isVisibleOriAccForm={isVisibleOriAccForm}
          setOriAccFormModalVisible={this.setOriAccFormModalVisible}
          creaDivAccount={this.creaDivAccount}
          defaultAccountBalance={defaultAccountBalance}
        />
      </View>
    );
  }
}
