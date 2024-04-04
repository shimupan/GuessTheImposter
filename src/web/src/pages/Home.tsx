import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Home = () => {
   const Auth = useContext(AuthContext);
   const Socket = useContext(SocketContext);

   useEffect(() => {
      const username = localStorage.getItem('username');
      if (username) {
         Auth?.setUsername(username);
      }
   }, []);

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const id = toast.loading('Updating username...');
      if (!e.currentTarget.username.value) {
         toast.update(id, {
            render: 'Please Enter a Username!',
            type: 'error',
            isLoading: false,
            autoClose: 1000,
            hideProgressBar: false,
         });
         return;
      }
      localStorage.setItem('username', e.currentTarget.username.value);
      console.log(e.currentTarget.username.value);
      Auth?.setUsername(e.currentTarget.username.value);
      toast.update(id, {
         render: 'Username Updated!',
         type: 'success',
         isLoading: false,
         autoClose: 1000,
         hideProgressBar: false,
      });
   };

   const CreateRoom = () => {
      Socket?.socket?.emit('create-room');
   };

   const JoinRoom = () => {};

   return (
      <>
         <div className='bg-[#0077B6] h-screen overflow-hidden flex items-center justify-center'>
            <div className='bg-[#90E0EF] lg:w-5/12 md:6/12 w-6/12 shadow-3xl'>
               <form className='p-12 md:p-24' onSubmit={handleSubmit}>
                  <div className='flex flex-col md:flex-row items-center text-lg'>
                     <svg
                        className='absolute ml-3 hidden md:block'
                        width='24'
                        viewBox='0 0 24 24'
                     >
                        <path d='M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z' />
                     </svg>
                     <input
                        type='text'
                        id='username'
                        className='bg-gray-200 text-center py-2 md:py-4 focus:outline-none w-full'
                        placeholder={Auth?.username.toString() || 'Username'}
                     />
                     <button
                        type='submit'
                        className='font-medium text-white uppercase bg-[#03045E] h-[3.9rem] hover:bg-[#0353A4] transition duration-200 cursor-pointer mt-2 md:mt-0'
                     >
                        Confirm
                     </button>
                  </div>
                  <div className='flex flex-col mt-10'>
                     <button
                        type='button'
                        className='font-medium text-white uppercase bg-[#03045E] hover:bg-[#0353A4] transition duration-200 h-[3.8rem] cursor-pointer mt-4 w-full'
                        onClick={CreateRoom}
                     >
                        Create Room
                     </button>
                     <button
                        type='button'
                        className='font-medium text-white uppercase bg-[#03045E] hover:bg-[#0353A4] transition duration-200 h-[3.8rem] cursor-pointer mt-4 w-full'
                        onClick={JoinRoom}
                     >
                        Join Room
                     </button>
                  </div>
               </form>
            </div>
            <ToastContainer position="top-center" />
         </div>
      </>
   );
};
