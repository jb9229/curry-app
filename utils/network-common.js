import { Alert } from 'react-native';
import openbankInfo from '../constants/OpenBankInfo';
import Exception from '../common/Exception';

export function handleJsonResponse(res) {
  if (res.ok) {
    if (res.status === 204) {
      // NO_CONTENTS
      return res;
    }

    return res.json();
  }

  const errorMessage = `${res.status}, ${res.statusText}, ${res.url}`;

  const error = new Error(errorMessage);
  error.response = res;
  throw error;
}

export function handleOpenBankJsonResponse(res) {
  if (res.ok) {
    if (res.status === 204) {
      // NO_CONTENTS
      return res;
    }

    return res.json().then((responseJson) => {
      const rspCode = responseJson.rsp_code;

      if (rspCode === openbankInfo.API_RESPONSECODE_OK) {
        return responseJson;
      }

      throw new Exception(rspCode, responseJson.rsp_message);
    });
  }

  const errorMessage = `${res.statusText}, ${res.url}`;

  const error = new Exception(res.status, errorMessage);
  throw error;
}

export function dispatchJsonSuccResponse(res, succFunction) {
  if (res.ok) {
    if (res.status === 204) {
      // NO_CONTENTS
      succFunction();
      return res;
    }

    return res.json().then(responseJson => succFunction(responseJson));
  }

  const errorMessage = `${res.status}, ${res.statusText}, ${res.url}`;

  Alert.alert(
    `예기치 못한 서버 장애 입니다, \n${errorMessage}\n문제현상 리포트 해 주시면 조속히 조치하는데 많은 도움이 됩니다.`,
  );

  return res;
}

export function dispatchJsonResponse(res, succFunction, failFunction) {
  if (res.ok) {
    if (res.status === 204) {
      // NO_CONTENTS
      succFunction();
    } else {
      succFunction(res.json());
    }
  }

  failFunction();
}

export function handleNetworkError(error) {
  console.log(error);

  Alert.alert(`네트워크 통신에 실패 했습니다, 인터넷 연결 상태를 확인 해주세요\n${error.message}`);
}

export function dispatchNetworkError(error, failDispatchFunction) {
  console.log(error);

  Alert.alert(`네트워크 통신에 실패 했습니다, 인터넷 연결 상태를 확인 해주세요\n${error.message}`);

  failDispatchFunction();
}
