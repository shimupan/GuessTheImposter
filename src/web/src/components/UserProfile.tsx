import { useEffect, useState } from "react";

export const UserProfile = ({username, leader, className}: {username: string, leader: boolean, className?: string}) => {
    const [number, setNumber] = useState(0);
    useEffect(() => {
        if(!localStorage.getItem('number')) {
            const num = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
            localStorage.setItem('number', num.toString());
            setNumber(num);
        } else {
            setNumber(parseInt(localStorage.getItem('number') || '0'));
        }
    }, []);

    return (
        <div className={`mx-2 bg-white rounded-lg shadow-md p-5 ${className}`}>
            <img className="w-32 h-32 rounded-full mx-auto" src={`https://cdn.discordapp.com/embed/avatars/${number}.png`} alt="Profile picture" />
            <h2 className="text-center text-2xl font-semibold mt-3">{username}</h2>
            <p className="text-center text-sm text-gray-500">{leader ? 'Leader' : 'Player'}</p>
        </div>
    );
};