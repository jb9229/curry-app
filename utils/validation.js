export const validation = {
  decimal: {
    format: {
      pattern: /^\d{0,9}$/,
      message: '숫자(정수)만 입력해 주세요.',
    },
  },
  textMax: {
    length: {
      maximum: {
        message: '최대문자: ',
      },
    },
  },
  textMin: {
    length: {
      minimum: {
        message: '최소문자: ',
      },
    },
  },
  decimalMax: {
    format: {
      pattern: /^\d*$/,
      message: '숫자(정수)만 입력해 주세요.',
    },
    length: {
      maximum: {
        message: '최대값:',
      },
    },
  },
};

export function validatePresence(value) {
  const resp = [null, null];

  if (value === '' || value == null) {
    resp[0] = false;
    resp[1] = '필수 항목 입니다, 빈칸을 채워 주세요.';
  } else {
    resp[0] = true;
  }

  return resp;
}

export function validate(nameField, value, essential, compareValue) {
  const resp = [null, null];

  if (Object.prototype.hasOwnProperty.call(validation, nameField)) {
    const v = validation[nameField];

    if (value === '' || value == null) {
      if (essential) {
        resp[0] = false;
        resp[1] = '필수 항목 입니다, 빈칸을 채워 주세요.';
      } else {
        resp[0] = true;
      }
    }

    if (Object.prototype.hasOwnProperty.call(v, 'format') && !v.format.pattern.test(value)) {
      resp[0] = false;
      resp[1] = v.format.message;
    }

    if (Object.prototype.hasOwnProperty.call(v, 'length')) {
      const l = v.length;

      if (nameField.startsWith('decimal')) {
        if (Object.prototype.hasOwnProperty.call(l, 'minimum') && value < compareValue) {
          resp[0] = false;
          resp[1] = l.minimum.message + compareValue;
        } else if (Object.prototype.hasOwnProperty.call(l, 'maximum') && value > compareValue) {
          resp[0] = false;
          resp[1] = l.maximum.message + compareValue;
        } else {
          resp[0] = true;
        }
      } else if (nameField.startsWith('text')) {
        if (Object.prototype.hasOwnProperty.call(l, 'minimum') && value.length < compareValue) {
          resp[0] = false;
          resp[1] = l.minimum.message + compareValue;
        } else if (
          Object.prototype.hasOwnProperty.call(l, 'maximum')
          && value.length > compareValue
        ) {
          resp[0] = false;
          resp[1] = l.maximum.message + compareValue;
        } else {
          resp[0] = true;
        }
      } else {
        resp[0] = true;
      }
    } else if (Object.prototype.hasOwnProperty.call(v, 'format') && !v.format.pattern.test(value)) {
      resp[0] = false;
      resp[1] = v.format.message;
    } else {
      resp[0] = true;
    }
  } else {
    resp[0] = true;
  }

  // console.log(`${resp[0]} / ${resp[1]}`);
  return resp;
}
