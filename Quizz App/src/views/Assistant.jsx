import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import AIResponse from "./AIResponse";
import { SelectRangeContext } from "react-day-picker";

const Assistant = () => {
  
  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState(null);


  
  const handleSubmitAssistant = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:3000/chat", {
      prompt: prompt,
    });
     // Assuming res.data is the object you want
    const parsedData = JSON.parse(res.data.message);
    console.log(parsedData.questions);
    setData(parsedData);
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
      
      <div className="">
          {/* <h3 className="font-bold text-lg">Hello, {userData?.username}</h3> */}
          <p className="py-4">Ask me anything, please.</p>
          <input
            className="w-64 h-10 border"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={handleSubmitAssistant} className="btn">
            Ask
          </button>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
            </form>

            
            {data?.questions?.map((question, index) => (
              <div key={index} className="flex flex-col">
                <p>{question.content}</p>
                <p>{question.answers}</p>
                <p>{question.correctAnswers}</p>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default Assistant;
