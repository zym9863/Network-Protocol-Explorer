import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

/**
 * HTTP请求工具类
 */
class HttpRequest {
  private instance: AxiosInstance

  constructor(baseURL: string = '/api') {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 可以在这里添加token等认证信息
        return config
      },
      (error) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response
        
        // 检查业务状态码
        if (data.success === false) {
          ElMessage.error(data.error || '请求失败')
          return Promise.reject(new Error(data.error || '请求失败'))
        }

        return response
      },
      (error) => {
        console.error('响应错误:', error)
        
        let message = '网络错误'
        
        if (error.response) {
          const { status, data } = error.response
          
          switch (status) {
            case 400:
              message = data?.error || '请求参数错误'
              break
            case 401:
              message = '未授权，请重新登录'
              break
            case 403:
              message = '拒绝访问'
              break
            case 404:
              message = '请求的资源不存在'
              break
            case 500:
              message = '服务器内部错误'
              break
            default:
              message = data?.error || `请求失败 (${status})`
          }
        } else if (error.request) {
          message = '网络连接失败，请检查网络'
        }

        ElMessage.error(message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * GET请求
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config).then(res => res.data)
  }

  /**
   * POST请求
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config).then(res => res.data)
  }

  /**
   * PUT请求
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config).then(res => res.data)
  }

  /**
   * DELETE请求
   */
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config).then(res => res.data)
  }

  /**
   * 文件上传
   */
  upload<T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }).then(res => res.data)
  }

  /**
   * 获取原始axios实例
   */
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// 创建默认实例
const request = new HttpRequest()

export default request
export { HttpRequest }
