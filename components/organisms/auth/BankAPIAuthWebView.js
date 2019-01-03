import React from 'react';
import {
  Button, Text, View, WebView,
} from 'react-native';

import { bankOpenApiUrl_oauthAuthorize2 } from '../../../constants/Network';

export default class BankAPIAuthWebView extends React.Component {
  receiveWebViewMSG = (webViewData) => {
    console.log(`######### receiveWebViewMSG ############${webViewData}`);

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
      this.props.navigation.navigate('Links');
    }

    if (webData.type === 'ASK_SAVETOKEN') {
      let tokenData: {
        access_token: webData.data.access_token,
        token_type: webData.data.token_type,
        expires_in: webData.data.expires_in,
        scope: webData.data.scope,
        client_use_code: webData.data.client_use_code,
      };
    }

    if (postData != null) {
      this.webView.postMessage(postData);
    }
  };

  render() {
    const paramData = {
      client_id: 'l7xx4ff929f59df4407d8212fd86f7388046',
      response_type: 'code',
      lang: '',
      edit_option: '',
      scope: 'login transfer',
      redirect_uri: 'https://jb9229.github.io/openBankApiCallback/index.html',
      client_info: 'test+whatever+you+want',
      auth_type: 0,
      bg_color: '#FAFAFA',
      txt_color: '#050505',
      btn1_color: '#006DB8',
      btn2_color: '#818487',
    };

    const paramsStr = Object.keys(paramData)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(paramData[k])}`)
      .join('&');

    console.log(paramsStr);
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
          ref={view => (this.webView = view)}
          source={{
            uri: `${bankOpenApiUrl_oauthAuthorize2}?${paramsStr}`,
            // uri: 'https://jb9229.github.io/openBankApiCallback/index.html',
          }}
          style={{
            width: 380,
            height: 600,
            marginTop: 20,
            marginLeft: 5,
            marginRight: 5,
          }}
          onMessage={event => this.receiveWebViewMSG(event.nativeEvent.data)}
        />

        <Text style={{ fontSize: 30 }}>This is a modal!</Text>
        <Button onPress={() => this.props.navigation.navigate('Links')} title="Dismiss" />
      </View>
    );
  }
}
