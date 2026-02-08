export default function FileUpload({ setCode }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader(); // Standard browser tool to read files
      reader.onload = (event) => {
        setCode(event.target.result); // Sends text to Monaco
      };
      reader.readAsText(file); 
    }
  };

  return (
    <div className="card">
      <h3>Upload Code File</h3>
      <input 
        type="file" 
        onChange={handleFileChange} 
        accept=".js,.py,.java,.cpp,.c" // Restrict to code files
      />
    </div>
  );
}