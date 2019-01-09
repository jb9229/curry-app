import React from 'react';
import {
  Alert, Button, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: '통장 추가',
  };

  constructor(props) {
    super(props);
    this.state = {
      defDivAccDescription: '',
    };
  }

  createOriAcc = () => {
    const { navigation } = this.props;
    const { defDivAccDescription } = this.state;

    const userId = 1; // Test Code
    if (defDivAccDescription === '') {
      Alert.alert('대표 나누기통장명을 기입 해 주세요.');
    }
    navigation.navigate('OpenBankAuth', {
      type: 'ADD_ACCOUNT',
      userId,
      defDivAccDescription,
    });
  };

  render() {
    const { navigation } = this.props;
    const { defDivAccDescription } = this.state;

    return (
      <ScrollView style={styles.container}>
        <View>
          <Text>초기 나누기 통장 별칭: </Text>
          <TextInput
            value={defDivAccDescription}
            onChangeText={description => this.setState({ defDivAccDescription: description })}
            placeholder="대표 나누기 통장명(????? 입출금이 일어남)"
          />
        </View>

        <View>
          <Button
            onPress={() => this.createOriAcc()}
            title="통장 생성"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
          <Button
            onPress={() => navigation.navigate('OpenBankAuth', { type: 'REAUTH' })}
            title="재인증"
            accessibilityLabel="Re Authorizition"
          />
        </View>
      </ScrollView>
    );
  }
}
