import { Button } from "@mui/material"
import { type ChangeEvent } from "react"


const LoginForm = ({
  setterFunc
}: {
  setterFunc: (x: string) => void
}) => {
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
      if (!res.ok) throw new Error("Server error. Failed to uplaod .env file!");
      
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
    <div>
        Upload .env file with provided credentials to login
        <div className="mt-2">
          <Button component="label" variant="outlined">
              Choose .env
              <input type="file" accept=".env" hidden onChange={handleInput} />
          </Button>
        </div>
    </div>
  )
}

export default LoginForm