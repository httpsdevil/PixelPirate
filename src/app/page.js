"use client";

import { useState, useEffect } from "react";

// --- SVG Icons (No changes needed, they are perfect) ---
const PinterestIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="#ef4444" className="text-red-500"><path d="M7.54 23.15q-.2-2.05.26-3.93L9 14.04a7 7 0 0 1-.35-2.07c0-1.68.81-2.88 2.09-2.88.88 0 1.53.62 1.53 1.8q0 .57-.23 1.28l-.52 1.72q-.15.5-.15.92c0 1.2.91 1.87 2.08 1.87 2.09 0 3.57-2.16 3.57-4.96 0-3.12-2.04-5.12-5.05-5.12-3.36 0-5.49 2.19-5.49 5.24 0 1.22.38 2.36 1.11 3.14-.24.41-.5.48-.88.48-1.2 0-2.34-1.69-2.34-4 0-4 3.2-7.17 7.68-7.17 4.7 0 7.66 3.29 7.66 7.33s-2.88 7.15-5.98 7.15a3.8 3.8 0 0 1-3.06-1.48l-.62 2.5a11 11 0 0 1-1.62 3.67A11.98 11.98 0 0 0 24 12a11.99 11.99 0 1 0-24 0 12 12 0 0 0 7.54 11.15"></path></svg>);
const InstagramIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#insta-gradient-stroke)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="2.5"></line></svg>);
const YouTubeIcon = () => (<svg width="28" height="28" viewBox="0 0 28 28" fill="#dc2626" className="text-red-600"><path d="M27.5 7.6s-.3-2.1-1.2-3c-1.1-1.2-2.4-1.2-3-1.3C19.3 3 14 3 14 3s-5.3 0-9.3.3c-.6.1-1.9.1-3 1.3-1 1-1.2 3-1.2 3S.5 10 .5 12.4v3.2c0 2.4.3 4.8.3 4.8s.3 2.1 1.2 3c1.1 1.2 2.6 1.2 3.3 1.3 2.5.2 8.5.3 8.5.3s5.3 0 9.3-.3c.6-.1 1.9-.1 3-1.3 1-1 1.2-3 1.2-3s.3-2.4.3-4.8v-3.2c0-2.4-.3-4.8-.3-4.8zM11.2 18.2V9.8L18.5 14l-7.3 4.2z"></path></svg>);
const DownloadIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>);
const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
const ArrowLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><polyline points="20 6 9 17 4 12"></polyline></svg>);

// Component for the Header
const Header = () => (
    <header className="px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center w-full">
            <div className="flex justify-center md:justify-start w-full">
                <img src="/logo.svg" alt="Logo" className="h-32 w-32 rounded-md" />
            </div>
        </nav>
    </header>
);

// Component for the "What We Offer" section
const FeaturesSection = () => {
    const features = [
        "Pinterest Profile Picture Downloader",
        "YouTube Channel Profile Picture Downloader",
        "YouTube Video/Shorts Thumbnail Downloader",
        "YouTube Post Picture Downloader",
        "Instagram Profile Picture Downloader",
        "High-Resolution Image Quality",
        "Completely Free and Unlimited",
        "Fast, Secure, and Anonymous"
    ];

    return (
        <section className="bg-white py-6 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Everything You Can Do
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        One simple tool for all your profile picture and thumbnail needs.
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                            <div className="flex-shrink-0">
                                <CheckIcon />
                            </div>
                            <p className="ml-3 text-base text-slate-700">{feature}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Component for the Footer
const Footer = () => (
    <footer className="bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} PixelPirate. All Rights Reserved.</p>
        </div>
    </footer>
);

export default function HomePage() {
    // --- State and Logic (Mostly unchanged) ---
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [platform, setPlatform] = useState("none");
    const [userData, setUserData] = useState(null);
    const [view, setView] = useState('search');
    const [displaySubtitle, setDisplaySubtitle] = useState("");

    const theme = {
        pinterest: { name: "Pinterest", placeholder: "https://www.pinterest.com/username", ringColor: "focus-within:ring-red-500", buttonStyle: { backgroundColor: '#ef4444' }, shadow: "shadow-red-500/50" },
        instagram: { name: "Instagram", placeholder: "https://www.instagram.com/username", ringColor: "focus-within:ring-[#dc2743]", buttonStyle: { backgroundImage: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #bc1888)' }, shadow: "shadow-[#e6683c]/50" },
        youtube: { name: "YouTube", placeholder: "https://www.youtube.com/@channelname or video link", ringColor: "focus-within:ring-red-600", buttonStyle: { backgroundColor: '#dc2626' }, shadow: "shadow-red-600/50" },
        none: { name: "", placeholder: "Paste a URL from a supported platform...", ringColor: "focus-within:ring-indigo-500", buttonStyle: { backgroundColor: '#6b7280' }, shadow: "shadow-slate-500/50" }
    };

    const currentTheme = theme[platform];

    useEffect(() => {
        if (url.includes("pinterest.com")) setPlatform("pinterest");
        else if (url.includes("instagram.com")) setPlatform("instagram");
        else if (url.includes("youtube.com") || url.includes("youtu.be")) setPlatform("youtube");
        else setPlatform("none");
    }, [url]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (platform === 'none') {
            setError("Please enter a valid Instagram, Pinterest, or YouTube profile URL.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch("/api/download", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Something went wrong.");
            }
            const data = await response.json();
            setUserData(data);

            const isYouTubeVideoOrShort = (url.includes("/watch?") || url.includes("/shorts/") || url.includes("youtu.be/")) && !url.includes("/@");
            if (platform === 'youtube' && !isYouTubeVideoOrShort) {
                setDisplaySubtitle(data.username || "");
            } else if (platform !== 'youtube') {
                setDisplaySubtitle(data.username ? `@${data.username}` : "");
            } else {
                setDisplaySubtitle("");
            }
            setView('result');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setView('search');
        setError(null);
        setUrl('');
    };

    return (
        <>

            <style jsx global>{`
        /* 2. CHANGE the font-family here to your custom font's name */
        body { 
          font-family: 'MyCustomFont', sans-serif; /* Use the name you defined in globals.css */
          background-color: #f8fafc;
        }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        .shake-error { animation: shake 0.5s ease-in-out; }
      `}</style>

            <svg width="0" height="0" style={{ position: 'absolute' }}><defs><linearGradient id="insta-gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: '#bc1888' }} /><stop offset="50%" style={{ stopColor: '#dc2743' }} /><stop offset="100%" style={{ stopColor: '#f09433' }} /></linearGradient></defs></svg>

            <div className="bg-slate-50 text-slate-800">
                <Header />

                <main>
                    {/* --- HERO SECTION --- */}
                    <section className="text-center px-4 pt-0 pb-10 sm:pt-0 sm:pb-6">
                        <div className="max-w-2xl mx-auto">
                            {/* The conditional rendering now happens inside this container */}
                            <div className={`transition-opacity duration-500 ${view === 'search' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                                    The Easiest Way to Download Profile Pictures
                                </h1>
                                <p className="mt-6 max-w-lg mx-auto text-lg text-slate-600">
                                    Grab high-quality profile pictures and thumbnails from Instagram, Pinterest, and YouTube in seconds.
                                </p>

                                {/* Supported Platforms */}
                                <div className="flex justify-center gap-6 mt-8">
                                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-100 border border-slate-200"><InstagramIcon /><span className="text-sm font-medium">Instagram</span></div>
                                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-100 border border-slate-200"><PinterestIcon /><span className="text-sm font-medium">Pinterest</span></div>
                                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-100 border border-slate-200"><YouTubeIcon /><span className="text-sm font-medium">YouTube</span></div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto">
                                    <div className={`flex items-center w-full h-14 bg-white border border-slate-300 rounded-xl shadow-sm ring-2 ring-transparent transition-all duration-300 ${currentTheme.ringColor}`}>
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder={currentTheme.placeholder}
                                            className="flex-1 h-full px-4 text-base text-gray-800 bg-transparent border-none rounded-l-xl focus:outline-none focus:ring-0 placeholder-slate-400"
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !url || platform === 'none'}
                                            className="h-11 mr-1.5 ml-1.5 px-5 text-white font-semibold transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg flex items-center justify-center"
                                            style={currentTheme.buttonStyle}
                                        >
                                            {isLoading ? <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <ArrowRightIcon />}
                                        </button>
                                    </div>
                                    {error && <p className={`text-red-600 text-center mt-4 bg-red-100 p-3 rounded-lg text-sm shake-error`}>{error}</p>}
                                </form>
                            </div>

                            {/* --- RESULT DISPLAY --- */}
                            <div className={`transition-opacity duration-500 ${view === 'result' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                                {userData && (
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col items-center">
                                        <img src={userData.previewUrl} alt={`${userData.name || userData.username}'s Profile`} className={`w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl ${currentTheme.shadow}`} />

                                        {userData.name && <h3 className="text-3xl font-bold text-gray-900 mt-6">{userData.name}</h3>}
                                        {displaySubtitle && <p className="text-lg text-gray-500 mt-1">{displaySubtitle}</p>}

                                        <a href={userData.downloadUrl} download target="_blank" rel="noopener noreferrer"
                                            className="mt-8 inline-flex w-full max-w-xs justify-center items-center gap-2 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105"
                                            style={currentTheme.buttonStyle}
                                        >
                                            <DownloadIcon /> Download Full Size
                                        </a>
                                        <button onClick={handleBack} className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition mt-4 font-semibold">
                                            <ArrowLeftIcon /> Search Another
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <FeaturesSection />
                </main>

                <Footer />
            </div>
        </>
    );
}