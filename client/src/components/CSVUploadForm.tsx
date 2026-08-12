import { FindInPage, UploadFile } from "@mui/icons-material";
import { Button } from "@mui/material"
import { useState, type ChangeEvent } from "react"
import type { StudentRow } from "../types";

const CSVUploadForm = ({
    setterFunc,
    setErr
}: {
    setterFunc: (studentRows: StudentRow[]) => void,
    setErr: (x: null) => void
}) => {
    const [file, setFile] = useState<File | null>(null);
  
    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);

    }

    const uploadMutation = async () => {
        try {
            if (!file) throw new Error("No file selected!");

            const formData = new FormData();
            formData.append("file", file);
            
            const res = await fetch("http://localhost:3000/api/upload/csv", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (!res.ok) { 
                setErr(data.error);
                setterFunc([]);
                throw new Error("Server error. Failed to upload .csv file");
            }
            
            setterFunc(data.students);
            
            return data;
        } catch (error) {
            console.error(error);
            return;
        }
    }
    
  return (
        <div className="py-2 px-4 rounded-lg bg-gray-400/25">
            <p className="mb-4">Upload expelled students .csv file</p>
            <div className="flex justify-between">
                <Button component="label" variant="outlined" startIcon={<FindInPage />}>
                Choose .csv
                <input type="file" accept=".csv" hidden onChange={handleInput} />

            </Button>
                
            <Button startIcon={<UploadFile />} variant="contained" size="small" onClick={() => uploadMutation()}>Upload</Button>
            </div>
            <p className="mb-2">Selected: <i>{file ? file.name : "nothing"}</i></p>
        </div>
  )
}

export default CSVUploadForm