import React from 'react';
import {
  Alert, AsyncStorage, ActivityIndicator, Button, Text, View, WebView,
} from 'react-native';

import { OPENBANK_AUTHORIZE2, OPENBANK_REAUTHORIZE2 } from '../../../constants/Network';
import Pkey from '../../../constants/Persistkey';
import * as api from '../../../api/api';
import { getOpenBankAuthInfo } from '../../../common/AuthToken';

const TYPE_REAUTH = 'REAUTH';
const ADD_ACCOUNT = 'ADD_ACCOUNT';

export default class OpenBankAuthWebView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isWebViewLoadingComplete: false,
      noticeMSG:
        '오픈뱅크 사용 권한이 만료 되었습니다(재인증 기간 만료 또는 1년 정기적 재인증), 재인증 해 주세요',
    };
  }

  /**
   * 사용자정보에서 fintech_use_num 추출 함수
   * @param {Array} oriAccList 핀테크이용번호 리스트
   * @param {Array<Object>} accountListInfo 계좌목록정보
   */
  getOpenbankAccInfo = (oriAccList, accountListInfo) => {
    const accList = accountListInfo.res_list;

    // validation
    if (accList.length !== oriAccList.length + 1) {
      Alert.alet(
        '유효하지 않은 핀테크이용번호가 존재하여 원통장의 핀테크이용번호를 찾을 수 없습니다, 관리자에게 문의 부탁 드립니다.',
      );
    }

    // make FintechUseNum List
    const fintechUseNumList = [];
    oriAccList.forEach((oriAccount) => {
      fintechUseNumList.push(oriAccount.fintechUseNum);
    });

    accList.forEach((accInfo) => {
      const candidateFUN = accInfo.fintech_use_num;
      if (!fintechUseNumList.includes(candidateFUN)) {
        return accInfo;
      }
    });

    return undefined;
  };

  /**
   * 웹뷰 종료 함수
   */
  closeWebView = () => {
    const { navigation } = this.props;

    this.setState({ noticeMSG: '곧(10초) 창이 닫힙니다~' });

    setTimeout(() => {
      navigation.navigate('Home', { action: 'RELOAD' });
    }, 5000);
  };

  /**
   * 웹페이지 메세지 처리 함수
   * @param {string} webViewMSG Webview에서 전달된 메세지
   */
  receiveWebViewMSG = async (webViewMSG) => {
    const { navigation } = this.props;
    const { type, userId, defDivAccDescription } = navigation.state.params;

    const webData = JSON.parse(webViewMSG);
    let postData = null;

    // 오픈뱅크정보 요청
    if (webData.type === 'ASK_BANKAPIINFO') {
      const apiData = {
        client_id: 'l7xx4ff929f59df4407d8212fd86f7388046',
        client_secret: 'f3fc3a0536b846ca86e8470b8cd35fea',
        redirect_uri: 'https://jb9229.github.io/openBankApiCallback/index.html',
      };

      postData = JSON.stringify(apiData);
    }

    // 웹뷰 종료 요청
    if (webData.type === 'ASK_WEBVIEWCLOSE') {
      navigation.navigate('Links');
    }

    // 인증토큰 저장 요청
    if (webData.type === 'ASK_SAVETOKEN') {
      const tokenData = {
        access_token: webData.data.access_token,
        token_type: webData.data.token_type,
        expires_in: webData.data.expires_in,
        refresh_token: webData.data.refresh_token,
        scope: webData.data.scope,
        user_seq_no: webData.data.user_seq_no,
      };

      await getOpenBankAuthInfo(JSON.stringify(tokenData));

      if (type === ADD_ACCOUNT) {
        // fintech_use_num 알아내기
        const accountListInfo = api.getAccountList(tokenData.user_seq_no);

        if (accountListInfo === undefined) {
          return;
        }

        const oriAccList = api.getOriAccList(userId);

        const openBankAccInfo = this.getOpenbankAccInfo(oriAccList, accountListInfo);
        // 원통장 추가 요청

        const newOriAccount = api.createOriAcc(
          userId,
          openBankAccInfo.account_alias,
          openBankAccInfo.fintech_use_num,
          defDivAccDescription,
        );

        if (newOriAccount === undefined) {
          // TODO Exception proccess
        }
      }

      this.closeWebView();
    }

    if (postData != null) {
      this.webView.postMessage(postData);
    }
  };

  render() {
    const { navigation } = this.props;
    const { type } = navigation.state.params;
    const { isWebViewLoadingComplete, noticeMSG } = this.state;

    let authUrl;
    if (type === ADD_ACCOUNT) {
      authUrl = OPENBANK_AUTHORIZE2;
    } else if (type === TYPE_REAUTH) {
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
        {type === TYPE_REAUTH ? (
          <View>
            <Text>{noticeMSG}</Text>
          </View>
        ) : null}
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
            marginTop: 5,
            marginLeft: 5,
            marginRight: 5,
          }}
          onMessage={event => this.receiveWebViewMSG(event.nativeEvent.data)}
        />

        {!isWebViewLoadingComplete && <ActivityIndicator size="large" color="#0000ff" />}

        <Button onPress={() => this.closeWebView()} title="Close Modal" />
      </View>
    );
  }
}
