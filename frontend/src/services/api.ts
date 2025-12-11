import axios from 'axios'
import { ElMessage } from 'element-plus'

// API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// 上传文件服务地址 (用于显示上传的图片等)
export const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_URL || ''

/**
 * 获取完整的资源 URL
 * @param path 资源路径，如 /uploads/scripts/xxx.webp
 */
export const getResourceUrl = (path: string): string => {
  if (!path) return ''
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${UPLOAD_BASE_URL}${path}`
}

// 创建axios实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 管理员API使用adminToken
    if (config.url?.startsWith('/admin')) {
      const adminToken = localStorage.getItem('adminToken')
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`
      }
    } else {
      // 普通用户API使用token
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 管理员API和公共API直接返回数据，不包含code字段
    if (response.config.url?.startsWith('/admin') || response.config.url?.startsWith('/public')) {
      return { data: res }
    }

    // 普通API检查code字段
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401未授权，跳转登录
      if (res.code === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  (error) => {
    // 404错误通常是资源不存在，不需要显示弹窗
    // 401错误由前面的code检查处理
    const status = error.response?.status
    if (status !== 404 && status !== 401) {
      ElMessage.error(error.response?.data?.error || error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
