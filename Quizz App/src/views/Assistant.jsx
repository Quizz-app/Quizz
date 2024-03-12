import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import AIResponse from "./AIResponse";
import { SelectRangeContext } from "react-day-picker";

const Assistant = () => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null); // Changed from empty string to null
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const { userData } = useContext(AppContext);
  const { setContext } = useContext(AppContext);

  const handleClose = () => {
    document.getElementById("my_modal_1").close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await axios.post("http://localhost:3000/chat", {
      prompt: prompt,
    });

    setResponse(res.data); // Assuming res.data is the object you want
    setLoading(false);
    const parsedData = JSON.parse(res.data.message);
    console.log(parsedData.questions);
    setData(parsedData);

    setContext((prevContext) => ({ ...prevContext, questionData: parsedData }));
  };

  return (
    <div>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn"
        onClick={() => document.getElementById("my_modal_1").showModal()}
      >
        Click me!
      </button>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box w-3/4 h-3/4">
          <h3 className="font-bold text-lg">Hello, {userData?.username}</h3>
          <p className="py-4">Ask me anything, please.</p>
          <input
            className="w-64 h-10"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={handleSubmit} className="btn">
            Ask
          </button>
          <button className="btn" onClick={handleClose}>
            Close
          </button>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
            </form>

            {response && <AIResponse response={response.message} />}
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Assistant;
