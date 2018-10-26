// @flow
import React from 'react';
import {
  Alert, Picker, ScrollView, StyleSheet, Text, View,
} from 'react-native';

// import { MonoText } from '../components/StyledText';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  accountPicker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAccount: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
});

type Props = {};

type State = {
  isEmptyAccount?: boolean,
  title: string,
};

export default class HomeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null,
  };

  state = {
    isEmptyAccount: undefined,
    accounts: [],
    title: '',
  };

  componentDidMount() {
    this.requestAccountList();
  }

  requestAccountList() {
    return fetch(
      'https://testapi.open-platform.or.kr/v1.0/user/me?user_seq_no=0100000001&tran_dtime=20181026213437',
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=UTF-8',
          Authorization: 'Bearer 074c68d8-37be-4566-9c1a-ae06fff26ef3',
        },
      },
    )
      .then(response => response.json())
      .then((responseJson) => {
        this.setState(
          {
            isEmptyAccount: true,
            title: responseJson.user_name,
          },
          () => {},
        );
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error);
      });
  }

  render() {
    const { isEmptyAccount, accounts, title } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.accountPicker}>
          <Picker
            selectedValue={accounts}
            style={{ height: 50, width: 200 }}
            onValueChange={(itemValue, itemIndex) => this.setState({ accounts: itemValue })}
          >
            <Picker.Item label="하나 진범 카드" value="hanaAccountJinbeom" />
            <Picker.Item label="하나 정원 카드" value="hanaAccountJeongwon" />
          </Picker>
        </View>
        {isEmptyAccount === undefined && (
          <View style={styles.emptyAccount}>
            <Text>쪼갠 통장 로딩 중....</Text>
          </View>
        )}
        {isEmptyAccount && (
          <View style={styles.emptyAccount}>
            <Text>add Account</Text>
            <Text>{title}</Text>
          </View>
        )}
        {!isEmptyAccount && (
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} />
        )}
      </View>
    );
  }
}
