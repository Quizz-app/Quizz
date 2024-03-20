

export const Blocked = () => {

    return (
        <>

            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold">Whoopsie-daisy!</h1>
                        <p className="py-6 text-2xl"> It seems like the BrainBurst train has hit a bump, and you've been temporarily detoured. 🚧🚂</p>
                    </div>
                    <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                        <img src="https://ideogram.ai/api/images/direct/fdtR4ugGS52EgGo-9LWf9g.png" className="max-w-sm rounded-lg shadow-2xl" />
                    </div>
                </div>
            </div>
        </>
    );
}



export default Blocked;