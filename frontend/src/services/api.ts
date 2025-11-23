import axios from 'axios'
import type { ApiResponse } from '@/types'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
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

    // 管理员API直接返回数据，不包含code字段
    if (response.config.url?.startsWith('/admin')) {
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
    ElMessage.error(error.response?.data?.error || error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
