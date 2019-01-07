import React from 'react';
import {
  Alert, AsyncStorage, ActivityIndicator, Button, Text, View, WebView,
} from 'react-native';

import { OPENBANK_AUTHORIZE2, OPENBANK_REAUTHORIZE2 } from '../../../constants/Network';
import Pkey from '../../../constants/Persistkey';

export default class OpenBankAuthWebView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isWebViewLoadingComplete: false,
      authTokenData: null,
    };
  }

  receiveWebViewMSG = async (webViewData) => {
    console.log(`######### receiveWebViewMSG ############${webViewData}`);
    const { navigation } = this.props;

    const webData = JSON.parse(webViewData);

    let postData = null;
    if (webData.type === 'ASK_BANKAPIINFO') {
      const apiData = {
        client_id: 'l7xx4ff929f59df4407d8212fd86f7388046',
        client_secret: 'f3fc3a0536b846ca86e8470b8cd35fea',
        redirect_uri: 'https://jb9229.github.io/openBankApiCallback/index.html',
      };

      postData = JSON.stringify(apiData);
    }

    if (webData.type === 'ASK_WEBVIEWCLOSE') {
      navigation.navigate('Links');
    }

    if (webData.type === 'ASK_SAVETOKEN') {
      const tokenData = {
        access_token: webData.data.access_token,
        token_type: webData.data.token_type,
        expires_in: webData.data.expires_in,
        scope: webData.data.scope,
        client_use_code: webData.data.client_use_code,
      };

      this.setState({ authTokenData: tokenData });

      await this.saveAuthToken(tokenData);
    }

    if (postData != null) {
      this.webView.postMessage(postData);
    }
  };

  saveAuthToken = async (tokenData) => {
    try {
      await AsyncStorage.setItem(Pkey.PKEY_OPENBANKAUTHTOKEN, JSON.stringify(tokenData));
    } catch (error) {
      Alert.alert(error.name, error.message);
      return false;
    }

    return true;
  };

  render() {
    const { type } = this.props.navigation.state.params;
    const { isWebViewLoadingComplete } = this.state;

    let authUrl;
    if (type === 'AUTH_ACCOUNT') {
      authUrl = OPENBANK_AUTHORIZE2;
    } else if (type === 'REAUTH') {
      authUrl = OPENBANK_REAUTHORIZE2;
    }

    const paramData = {
      client_id: 'l7xx4ff929f59df4407d8212fd86f7388046',
      response_type: 'code',
      lang: '',
      edit_option: '',
      scope: 'login inquiry',
      redirect_uri: 'https://jb9229.github.io/openBankApiCallback/index.html',
      client_info: 'test+whatever+you+want',
      auth_type: 0,
      bg_color: '#FAFAFA',
      txt_color: '#050505',
      btn1_color: '#006DB8',
      btn2_color: '#818487',
    };

    /**
     * 재인증
     * Kftc-Bfop-UserSeqNo <user_seq_no> (선택) 기존 고객의 사용자일련번호
     * Kftc-Bfop-UserCI <user_ci> (선택) 사용자 CI(Connect Info)
     * Kftc-Bfop-UserName <user_name> (선택) 사용자명
     * Kftc-Bfop-UserInfo <user_info> (선택) 생년월일(8 자리)+성별(1 자리)
     * Kftc-Bfop-UserCellNo <user_cell_no> (선택) 휴대폰번호
     * Kftc-Bfop-PhoneCarrier [skt|ktf|lgt|
     * skm|ktm|lgm] (선택)
     * 이동통신사
     * [17p] 「이동통신사 코드표」 참조
     * Kftc-Bfop-UserEmail <user_email> (선택) 이메일주소
     */

    const paramsStr = Object.keys(paramData)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(paramData[k])}`)
      .join('&');

    console.log(paramsStr);
    const { authTokenData } = this.state;
    return (
      <View
        style={{
          flex: 1,
          padding: 5,
          margin: 5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WebView
          ref={(view) => {
            this.webView = view;
          }}
          source={{
            uri: `${authUrl}?${paramsStr}`,
            // uri: 'https://jb9229.github.io/openBankApiCallback/index.html',
          }}
          onLoadEnd={() => this.setState({ isWebViewLoadingComplete: true })}
          style={{
            width: 380,
            height: 600,
            marginTop: 20,
            marginLeft: 5,
            marginRight: 5,
          }}
          onMessage={event => this.receiveWebViewMSG(event.nativeEvent.data)}
        />

        {!isWebViewLoadingComplete && <ActivityIndicator size="large" color="#0000ff" />}

        <Button onPress={() => this.props.navigation.navigate('Links')} title="Close Modal" />

        <View>
          <View>
            <Text>Token Data</Text>
          </View>
          {authTokenData !== null ? (
            <View>
              <Text>{authTokenData.access_token}</Text>
              <Text>{authTokenData.token_type}</Text>
              <Text>{authTokenData.expires_in}</Text>
              <Text>{authTokenData.scope}</Text>
              <Text>{authTokenData.client_use_code}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}
