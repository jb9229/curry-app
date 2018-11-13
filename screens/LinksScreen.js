import React from 'react';
import {
  Button, ScrollView, StyleSheet, Text, TextInput, View,
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

  createAccount = () => {};

  render() {
    return (
      <ScrollView style={styles.container}>
        <View>
          <Text>생성 통장명: </Text>
          <TextInput placeholder="통장 설명" />
          <Text>초기 나누기 통장 별칭: </Text>
          <TextInput placeholder="디폴트 쪼갠 통장명(디폴트로 여기서 입출금이 일어남)" />
        </View>
        <View>
          <Button
            onPress={() => this.props.navigation.navigate('BankApiAuthModal')}
            title="통장 생성"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
      </ScrollView>
    );
  }
}
