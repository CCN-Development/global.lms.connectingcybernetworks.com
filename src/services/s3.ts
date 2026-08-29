import axios from 'axios'

export async function getSignedURLBackend(
    file_name: string,
    fileType: string,
    dir_name = 'crm/files'
): Promise<[string, string]> {
    try {
        const response = await fetch(
            `https://data.service.connectingcybernetworks.in/api/v1/public/get-signed-url`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_name,
                    fileType,
                    dir_name,
                }),
            }
        )
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (!data.success) {
            throw new Error(data.message || 'Failed to generate presigned URL')
        }
        return [data.data.presignedUrl, data.data.file_url]
    } catch (error) {
        console.error('Error generating presigned URL:', error)
        throw new Error('Internal server error')
    }
}

export async function fileUploaderToS3(
    file: File,
    onProgress: (progress: number) => void,
    onComplete: (fileUrl: string, key: string) => void
) {

    try {
        const [presignedUrl, fileUrl] = await getSignedURLBackend(
            file.name,
            file.type,
            'lms-onboarding/files'
        )
        if (!presignedUrl) {
            throw new Error(
                'Failed to get presigned URL for file: ' + file.name
            )
        }
        console.log(presignedUrl);

        await axios
            .put(presignedUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total === undefined) {
                        console.error(
                            'Total size is undefined for file:',
                            file.name
                        )
                        return
                    }
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onProgress(percentCompleted)
                    console.log(
                        `File: ${file.name} - Upload Progress: ${percentCompleted}%`
                    )
                },
            })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Failed to upload file: ' + file.name)
                }
            })
            .catch((error) => {
                console.error('Error uploading file:', error)
                throw error
            })
        onComplete(fileUrl, file.name)
    } catch (error) {
        console.error('Error uploading file:', error)
    }
}