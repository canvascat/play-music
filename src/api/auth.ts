import request, { noCacheParams } from '@/utils/request';
import * as NCMAPI from './NCMAPI';

/**
 * 手机登录
 * - phone: 手机号码
 * - password: 密码
 * - countrycode: 国家码，用于国外手机号登录，例如美国传入：1
 * - md5_password: md5加密后的密码,传入后 password 将失效
 */
export function loginWithPhone(params: NCMAPI.login_cellphone_1[0] | NCMAPI.login_cellphone_2[0] | NCMAPI.login_cellphone[0]) {
  return request({
    url: '/login/cellphone',
    method: 'post',
    params,
  });
}

/**
 * 邮箱登录
 * - email: 163 网易邮箱
 * - password: 密码
 * - md5_password: md5加密后的密码,传入后 password 将失效
 */
export function loginWithEmail(params: NCMAPI.login_1[0] | NCMAPI.login[0]) {
  return request({
    url: '/login',
    method: 'post',
    params,
  });
}

/**
 * 二维码key生成接口
 */
export function loginQrCodeKey() {
  return request({
    url: '/login/qr/key',
    method: 'get',
    params: noCacheParams({}),
  });
}

/**
 * 二维码生成接口
 * 说明: 调用此接口传入上一个接口生成的key可生成二维码图片的base64和二维码信息,
 * 可使用base64展示图片,或者使用二维码信息内容自行使用第三方二维码生产库渲染二维码
 * @param {Object} params
 * @param {string} params.key
 * @param {string=} params.qrimg 传入后会额外返回二维码图片base64编码
 */
export function loginQrCodeCreate(params: NCMAPI.login_qr_create[0]) {
  return request({
    url: '/login/qr/create',
    method: 'get',
    params: noCacheParams(params),
  });
}

/**
 * 二维码检测扫码状态接口
 * 说明: 轮询此接口可获取二维码扫码状态,800为二维码过期,801为等待扫码,802为待确认,803为授权登录成功(803状态码下会返回cookies)
 * @param {string} key
 */
export function loginQrCodeCheck(key: NCMAPI.login_qr_check[0]['key']) {
  return request({
    url: '/login/qr/check',
    method: 'get',
    params: noCacheParams({ key }),
  });
}

/**
 * 刷新登录
 * 说明 : 调用此接口 , 可刷新登录状态
 * - 调用例子 : /login/refresh
 */
export function refreshCookie() {
  return request({
    url: '/login/refresh',
    method: 'post',
  });
}

/**
 * 退出登录
 * 说明 : 调用此接口 , 可退出登录
 */
export function logout() {
  return request({
    url: '/logout',
    method: 'post',
  });
}
