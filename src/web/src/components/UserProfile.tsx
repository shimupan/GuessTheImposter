export const UserProfile = ({username, leader}: {username: string, leader: boolean}) => {
    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-5">
            <img className="w-32 h-32 rounded-full mx-auto" src={`https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * (5 - 0 + 1)) + 0}.png`} alt="Profile picture" />
            <h2 className="text-center text-2xl font-semibold mt-3">{username}</h2>
            {leader && <p className="text-center text-sm text-gray-500">Leader</p>}
        </div>
    );
};