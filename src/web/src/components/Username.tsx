import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const Username = () => {
   const Auth = useContext(AuthContext);
   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!e.currentTarget.username.value) {
         alert('Please enter a username');
         return;
      }
      localStorage.setItem('username', e.currentTarget.username.value);
      console.log(e.currentTarget.username.value);
      Auth?.setUsername(e.currentTarget.username.value);
      window.location.reload();
   };

   return (
      <>
         <div className='bg-[#0077B6] h-screen overflow-hidden flex items-center justify-center'>
            <div className='bg-[#90E0EF] lg:w-5/12 md:6/12 w-6/12 shadow-3xl'>
               <form className='p-12 md:p-24' onSubmit={handleSubmit}>
                  <div className='flex items-center text-lg'>
                     <svg
                        className='absolute ml-3'
                        width='24'
                        viewBox='0 0 24 24'
                     >
                        <path d='M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z' />
                     </svg>
                     <input
                        type='text'
                        id='username'
                        className='bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full'
                        placeholder={Auth?.username.toString() || 'Username'}
                     />
                     <button
                        type='submit'
                        className='font-medium text-white uppercase bg-[#03045E] h-[3.9rem] hover:bg-[#0353A4] transition duration-200 cursor-pointer'
                     >
                        Confirm
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
};
