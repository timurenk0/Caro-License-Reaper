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
    <div className="min-w-100 block absolute z-10" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <div className="flex justify-end">
            <button className="text-red-600 border-x rounded-md px-1 mb-2 cursor-pointer hover:bg-red-200/25" onClick={() => onClose(null)}><Close /></button>
        </div>
        <div className="border rounded py-2 px-4 flex flex-col">
            <section className="flex justify-between border-b border-b-black/25 pb-1 mb-4 items-center">
                <h1 className="text-2xl font-semibold">{error.code}</h1>
                <p className="italic text-sm">Status: {error.status}</p>
            </section>
            <section className="flex flex-col gap-y-2">
                <div>
                    <p className="font-semibold">Message:</p>
                    <i className="block">{error.message}</i>
                </div>
                { error.hint && (
                    <div>
                        <p className="font-semibold">Hint:</p>
                        <i className="block">{error.hint}</i>
                    </div>
                ) }
            </section>
        </div>
    </div>
  )
}

export default ErrorCard