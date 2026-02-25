import {
    PROGRESS_INTERVAL_MS,
    PROGRESS_STEP,
    REDIRECT_DELAY_MS,
} from "app/lib/constant"
import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react"
import { useRef, useState } from "react"
import { useOutletContext } from "react-router"

function processFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const dataUrl = reader.result as string
            const base64 = dataUrl.split(",")[1] ?? ""
            resolve(base64)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })
}

type UploadProps = {
    onComplete?: (base64: string) => void
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const { isSignedIn } = useOutletContext<AuthContext>()

    const handleFiles = (files: FileList | null) => {
        if (!isSignedIn || !files?.length) return
        const first = files[0]
        if (!/\.(jpg|jpeg|png)$/i.test(first.name)) return
        setFile(first)
        setProgress(0)
        processFile(first).then((base64) => {
            progressIntervalRef.current = setInterval(() => {
                setProgress((p) => {
                    const next = Math.min(p + PROGRESS_STEP, 100)
                    if (next >= 100 && progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current)
                        progressIntervalRef.current = null
                        setTimeout(() => {
                            onComplete?.(base64)
                        }, REDIRECT_DELAY_MS)
                    }
                    return next
                })
            }, PROGRESS_INTERVAL_MS)
        })
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files)
        e.target.value = ""
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (isSignedIn) setIsDragging(true)
    }

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (isSignedIn) handleFiles(e.dataTransfer.files)
    }

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? "is-dragging" : ""} ${!isSignedIn ? "is-disabled" : ""}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={onChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? (
                                "Click to upload or just drag and drop!"
                            ) : (
                                "Sign in or sign up to upload here"
                            )}
                        </p>
                        <p className="help">
                            Maximum file size is 50MB.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {
                                progress === 100 ? (
                                    <CheckCircle2 className="check" />
                                ) : (
                                    <ImageIcon className="image" />
                                )
                            }
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{
                                width: `${progress}%`
                            }} />

                            <p className="status-text">
                                {progress < 100 ? "Analyzing Floor Plan" : "Redirecting... Please wait..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Upload
