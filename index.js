const axios = require('axios')
const querystring = require('querystring')
const cookie = require('./cookie')
const randomPhone = require('../random-phone')
const logger = require('../logger')
const random = require('../random')
const timeout = require('../timeout')

const origin = 'https://h5.ele.me'

function create() {
  let count = 0
  let first = true
  let number = 0
  let record = 0
  let mobile2 = 0
  let res2 = 0
  let total = 0
  async function request({ mobile, url, userName } = {}) {
    const query = querystring.parse(url)
    mobile2 = mobile
    // 一定程度上错开了大家都同时从 0 绑的情况，虽然可能没什么卵用.
    // 10：因为饿了么hong-bao最多 10 人领，至少给后面留 10 个位置
    let index = random(0, cookie.length - 20)

    const request = axios.create({
      baseURL: origin,
      withCredentials: true,
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        origin,
        referer: `${origin}/hongbao/`,
        'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0; PRO 6 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043221 Safari/537.36 V1_AND_SQ_7.0.0_676_YYB_D QQ/7.0.0.3135 NetType/WIFI WebP/0.3.0 Pixel/1080',
      },
      transformRequest: [
        (data, headers) => {
          headers['X-Shard'] = `eosid=${parseInt(query.sn, 16)}`
          return JSON.stringify(data)
        },
      ],
    })

    return (async function lottery(phone) {

      let sns
       await timeout(100) //延时   注
      if (index >= cookie.length) {
        logger.error('index 超出范围')
        throw new Error('unlucky\n请次日再试')
      }
      if (arguments.length <= 1) {
        sns = cookie[index]
      } else {
        index = arguments[1]
        sns = cookie[arguments[1]]
      }
      if (arguments[2]) count = arguments[2]
       if(arguments.length===0 && number===1)
	{
              logger.error('最后一个小号领取400')
              return '请两分钟后自己点开领取最佳'
	}
      if (!query.sn || !query.lucky_number || isNaN(query.lucky_number)) {
        throw new Error('这个好像不是饿了么拼手气红包\n帮助：botii.cn')
      }

      phone = phone || randomPhone(mobile)
      // 绑定手机号
      if (count <= 3) {
        if (!(sns && sns.openid)) {
          //如果是cookie选择出错，那么重新选择一个cookie
          ++count
          return lottery(phone, index, count)
        } else {
          await request.put(`/restapi/v1/weixin/${sns.openid}/phone`, {
            sign: sns.eleme_key,
            phone,
          })
        }
      } else {
        throw new Error('unlucky\n请次日再试')
      }

      // 领hong-bao
      total++
      const {
        data: { promotion_records = [], ret_code },
      } = await request.post(`/restapi/marketing/promotion/weixin/${sns.openid}`, {
        device_id: '',
        group_sn: query.sn,
        hardware_id: '',
        method: 'phone',
        phone,
        platform: query.platform,
        sign: sns.eleme_key,
        track_id: '',
        unionid: 'fuck', // 别问为什么传 fuck，饿了么前端就是这么传的
        weixin_avatar:
          'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83epfYCqjeUUHdaEklkUHia04LB6tDrPk2z2Rxj4nkVHuzqkPjEubKaTG429IicM9HShVf5bhicf3xqmpg/132',
        weixin_username: phone === mobile ? phone : '皮卡丘',
      })

	  if (ret_code!=10)
	  {
		  logger.info('**************************'+phone)  //当出现不需要验证的手机号码时候 记录到日志里面
	  }

      index++
      if (number === 1) {
        await timeout(500) //等到是自己手机号领取的时候 延时500MS
        return lottery(mobile)
      }

      return lottery(null)
    })()
  }

  function response(options) {
    return new Promise(async resolve => {
      try {
        resolve({ message: await request(options) })
      } catch (e) {
        logger.error(e.message)
        resolve({
          message: e.message,
          status: (e.response || {}).status,
        })
      }
    })
  }

  return async options => {
    logger.info(JSON.stringify(options))
    let count = 0
    let res

    while (true) {
      res = await response(options)
      if (res.status !== 400 && res.status!==500) {
        break
      }
      if (++count >= 10000) {
        logger.error('400循环中!')
        res.message =
          number === 1 ? '请两分钟后自己点开领取最佳' : '饿了么出错太多啦 重发试试吧'
        break
      }
    }
    return res
  }
}

module.exports = create
