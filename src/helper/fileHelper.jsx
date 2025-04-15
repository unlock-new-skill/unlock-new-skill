import { uploadFileService } from '@api/uploadFileService'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'

const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg']

export async function uploadWithCompressed(file) {
	try {
		if (!allowedFileTypes.includes(file?.type)) {
			toast.error(
				'File type not allowed. Only jpg, jpeg, png are allowed.'
			)
			return
		}

		const [origin, compressed] = await Promise.all([
			(async () => {
				try {
					const formData = new FormData()

					formData.append('file', file)

					const data =
						await uploadFileService.updloadSellerDesign(formData)
					return data
				} catch (e) {
					console.log('🚀 ~ e:', e)
					throw new Error('Upload origin failed')
				}
			})(),
			(async () => {
				try {
					const options = {
						maxSizeMB: 0.1,
						maxWidthOrHeight: 200,
						useWebWorker: true
					}
					const compressedBlob = await imageCompression(file, options)
					// console.log('🚀 ~ compressedBlob:', compressedBlob)
					const compressedFile = new File(
						[compressedBlob],
						file.name,
						{
							type: file.type,
							lastModified: Date.now()
						}
					)
					// console.log('🚀 ~ compressedFile:', compressedFile)

					// compressedFile.name = compressedFile.name.replace
					const formData = new FormData()
					formData.append('file', compressedFile)
					const data =
						await uploadFileService.uploadCompressedImage(formData)
					return data
				} catch (error) {
					console.log('🚀 ~ error:', error)
				}
				// console.log('🚀 ~ name:', name)
				// console.log('🚀 ~ compressedBlob:', compressedBlob)
			})()
		])
		return {
			origin,
			compressed
		}
	} catch (e) {
		toast.error('Upload failed')
	}
}
