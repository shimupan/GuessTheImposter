export const RoomNotFound = () => {
    return (
       <div className='bg-[#0077B6] h-screen overflow-hidden flex items-center justify-center'>
          <div className='bg-[#90E0EF] lg:w-5/12 md:6/12 w-6/12 shadow-3xl'>
             <div className='p-12 md:p-24'>
                <h1 className='text-2xl font-bold text-center text-gray-700'>
                   Invalid Room
                </h1>
                <p className='mt-4 text-lg text-center text-gray-600'>
                   The room you're trying to join does not exist. Please check
                   the room ID and try again.
                </p>
             </div>
          </div>
       </div>
    );
};