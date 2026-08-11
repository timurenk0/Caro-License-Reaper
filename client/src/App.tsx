import CSVUploadForm from "./components/CSVUploadForm";

export default function App() {

  return (
    <main className="h-full p-2 grid grid-cols-2 gap-8">
      <section>
        <p>You've succeffully logged in!</p>

        <CSVUploadForm />
      </section>
    </main>
  );
}