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
          <Text>통장 별칭: </Text>
          <TextInput placeholder="통장 설명" />
        </View>
        <View>
          <Button
            onPress={this.createAccount}
            title="통장 생성"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
      </ScrollView>
    );
  }
}
