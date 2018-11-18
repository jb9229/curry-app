export const validation = {
  text: {
    presence: {
      message: '필수 항목 입니다, 빈칸을 채워 주세요.'
    }
  },
  decimal: {
    presence: {
      message: '숫자(정수)를 입력해 주세요.'
    },
    format: {
      pattern: /^\d{0,9}$/,
      message: '숫자(정수)만 입력해 주세요.'
    }
  },
  textMin5: {
    presence: {
      message: '필수 항목 입니다, 빈칸을 채워 주세요.'
    },
    length: {
      minimum: {
        val: 5,
        message: 'At least 5 characters'
      }
    }
  }
}

export function validate(nameField, value, essential){
  let resp = [null, null];


  if(validation.hasOwnProperty(nameField))
  {
    let v = validation[nameField]
    if(value == '' || value == null){
      if(essential){
        resp[0] = false
        resp[1] = v['presence']['message']
      }else{resp[0] = true}
    }else if(v.hasOwnProperty('length')){
      let l = v['length'];

      if(l.hasOwnProperty('minimum') && value.length < l['minimum']['val']){
        resp[0] = false
        resp[1] = l['minimum']['message']
      }else if(l.hasOwnProperty('maximum') && value.length > l['maximum']['val']){
        resp[0] = false
        resp[1] = l['maximum']['message']
      }
    }else if(v.hasOwnProperty('format') && !v['format']['pattern'].test(value)){
      resp[0] = false
      resp[1] = v['format']['message']
    }else{
      resp[0] = true
    }
  }else{
    resp[0] = true
  }

  return resp;
}
