import { UploadFile } from "@mui/icons-material";
import { Button } from "@mui/material"
import { useState, type ChangeEvent } from "react"

const CSVUploadForm = () => {
    const [file, setFile] = useState<File | null>(null);
  
    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
    }
    
  return (
    <div className="py-2 px-4 rounded-lg bg-gray-400/25">
        <p className="mb-4">Upload expelled students .csv file</p>
        <Button component="label" variant="contained" startIcon={<UploadFile />}>
            Upload .csv
            <input type="file" accept=".csv" hidden onChange={handleInput} />

        </Button>
        <p>Selected: <i>{file ? file.name : "nothing"}</i></p>        
    </div>
  )
}

export default CSVUploadForm