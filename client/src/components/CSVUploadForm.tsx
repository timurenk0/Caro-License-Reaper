import { UploadFile } from "@mui/icons-material";
import { Button } from "@mui/material"
import { useState, type ChangeEvent } from "react"

const CSVUploadForm = () => {
    const [file, setFile] = useState<File | null>(null);
  
    const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
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
                // credentials: "include"
            });

            const data = await res.json();
            if (!res.ok) throw new Error("Server error. Failed to upload .csv file");

            console.log(data);
            
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
            <Button component="label" variant="outlined">
            Choose .csv
            <input type="file" accept=".csv" hidden onChange={handleInput} />

        </Button>
            
        <Button endIcon={<UploadFile />} color="success" variant="contained" size="small" onClick={() => uploadMutation()}>Upload</Button>
        </div>
        <p className="mb-2">Selected: <i>{file ? file.name : "nothing"}</i></p>
    </div>
  )
}

export default CSVUploadForm