import { Button } from "@mui/material"
import { useState, type ChangeEvent } from "react"
import type { ServerError } from "../types";
import ErrorCard from "./ErrorCard";


const LoginForm = ({
  setterFunc
}: {
  setterFunc: (x: string) => void
}) => {
  const [err, setErr] = useState<ServerError | null>(null);
  
  const loginMutation = async (file: File | undefined) => {
    try {      
      if (!file) throw new Error("No .env file uploaded!");

      const formData = new FormData();
      formData.set("env", file);
      
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data.error);
        throw new Error("Server error. Failed to upload .csv file");
      };
      
      setterFunc(data.configId);
      return data;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const uploadedFile = e.target.files[0];

    await loginMutation(uploadedFile);
  }

  
  return (
    <div className="flex justify-center items-center">
      <div hidden={!!err} className="border rounded p-8 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Login Form</h1>
          Upload .env file with provided credentials to login
          <div>
            <Button component="label" variant="outlined">
                Choose .env
                <input type="file" accept=".env" hidden onChange={handleInput} />
            </Button>
          </div>

      </div>

      { err && (
        <ErrorCard error={err} onClose={setErr} />
      ) }
    </div>
  )
}

export default LoginForm