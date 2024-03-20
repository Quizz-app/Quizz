import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
    const navigate = useNavigate();
    return (

        <div className="hero min-h-screen" style={{ backgroundImage: 'url(https://ideogram.ai/api/images/direct/MEmPeOnlR0K05OC65v-tYg.png)' }}>
            <div className="hero-overlay bg-opacity-60"></div>
            <div className="hero-content text-center text-neutral-content w=3/4">
                <div className="">
                    <h1 className="mb-5 text-5xl font-bold">What led you to this page?</h1>
                    <div className="text-2xl flex flex-col w-">
                        <p className="mb-5">A) I followed a trail of digital breadcrumbs.</p>
                        <p className="mb-5">B) I was chasing a virtual rabbit down the rabbit hole.</p>
                        <p className="mb-5">C) I clicked on a link hoping for internet gold.</p>
                        <p className="mb-5">D) I took a shortcut through the digital jungle.</p>
                    </div>


                    <motion.button
                        onClick={() => navigate('/')}
                        className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-green-600 px-8 py-2 bg-green-500 rounded-md text-white font-bold transition duration-200 ease-linear "
                        initial={{ scale: 2 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
                    >
                        Home
                    </motion.button>

                </div>
            </div>
        </div>
    );
}

export default NotFound;