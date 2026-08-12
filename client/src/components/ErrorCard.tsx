import type { ServerError } from "../types"
import { Close } from "@mui/icons-material"

const ErrorCard = ({
    error,
    onClose
}: {
    error: ServerError,
    onClose: (x: null) => void
}) => {
    
  return (    
    <div className="block">
        <div className="flex justify-end">
            <button className="border px-1 mb-2 rounded cursor-pointer hover:bg-gray-200" onClick={() => onClose(null)}><Close /></button>
        </div>
        <div className="border rounded py-2 px-4 flex flex-col">
            <section className="flex justify-between border-b mb-4 items-center">
                <h1 className="text-2xl font-semibold">{error.code}</h1>
                <p className="italic text-sm">Status: {error.status}</p>
            </section>
            <section className="flex flex-col gap-y-2">
                <div>
                    <b>Message:</b>
                    <i className="block">{error.message}</i>
                </div>
                <div>
                    <b>Hint:</b>
                    <i className="block">{error.hint}</i>
                </div>
            </section>
        </div>
    </div>
  )
}

export default ErrorCard