import environment_variables from "../../envionment"
import axios, { AxiosError } from "axios"


type Props = {
    path: string
    baseURL?: string
    body?: object
    headers?: object
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
    params?: object
    loadingEndCallback?: () => void
    isVerbose?: boolean
    token?: string

}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? decodeURIComponent(match[2]) : null
}

export default async function axiosHandler(props: Props) {
    const token = props.token || getCookie('authToken') || null
    if (props.isVerbose) console.log("Enhanced Axios Called with props:", props)
    if (!['get', 'post', 'put', 'delete'].includes(props.method?.toLowerCase() || 'get')) throw new Error('Invalid HTTP method')
    if (props.body && typeof props.body !== 'object') throw new Error('Body must be an object')
    if (props.headers && typeof props.headers !== 'object') throw new Error('Headers must be an object')
    const baseUrl = props.baseURL || environment_variables.api_base_url
    try {
        const response = await axios({
            url: `${baseUrl}${props.path}`,
            method: props.method?.toLowerCase(),
            data: props.body,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
                ...props.headers,
            },
            params: props.params,
            fetchOptions:{
                credentials: 'include',
            }
        })
        const data = response.data as {
            success: boolean
            message: string
            data?: any
        }
        if (props.isVerbose) {
            console.log('Response data:', data)
        }
        if (data.success) {
            return data.data
        }
        throw new Error(data.message)

    } catch (error: AxiosError | any) {
        if(error instanceof AxiosError ){
            if(error.response?.data){
                const errData = error.response.data as {message: string}
                throw new Error(errData.message || 'Error making request')
            }
        }
        if (props.isVerbose) {
            console.error('Error making request:', error)
        }
        throw error
    } finally {
        if (props.loadingEndCallback) props.loadingEndCallback()
    }

}

