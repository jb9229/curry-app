import { Alert } from 'react-native';

export function handleResponse(res) {
  console.log(res);
  if (res.ok) {
    if (res.status === 204) {
      // NO_CONTENTS
      return res;
    }
    return res.json();
  }

  const status = res.status;

  if (status === 404) {
    Alert.alert(
      'Unexpect Excaption',
      `서버 연결에 실패 했습니다. 연결 상태를 확인 해 주세요
      \n${res.status}, ${res.statusText}, ${res.url}`,
    );
  } else {
    console.log(`status:${status}`);
    Alert.alert(
      'Unexpect Excaption',
      `고려되지 못한 상황 입니다, '하기 내용과 함께 이용했던 기능' 리포트 해 주시면 신속히 조치 하겠습니다.
      \n${res.status}, ${res.statusText}, ${res.url}`,
    );
  }
}
