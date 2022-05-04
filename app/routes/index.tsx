import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import doorHref from "~/assets/door.jpg";

export default function Index() {
  const user = useOptionalUser();
  // Split with navbar: https://tailwindui.com/components/marketing/sections/heroes
  return (
    <main className="lg:relative">
      <div className="mx-auto w-full max-w-7xl pt-16 pb-20 text-center lg:py-48 lg:text-left">
        <div className="px-4 sm:px-8 lg:w-1/2 xl:pr-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
            <span className="xl:inline- block">Access Management</span>{" "}
            <span className="block text-indigo-600 xl:inline">
              from the cloud
            </span>
          </h1>
          <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
            {user ? (
              "user"
            ) : (
              <>
                <div className="rounded-md shadow">
                  <Link
                    to="/join"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
                  >
                    Sign up
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <a
                    href="."
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg"
                  >
                    Live demo
                  </a>
                </div>
              </>
            )}
            {/* <div className="rounded-md shadow">
              <a
                href="."
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
              >
                Get started
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a
                href="."
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg"
              >
                Live demo
              </a>
            </div> */}
          </div>
        </div>
      </div>
      <div className="relative h-64 w-full sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={doorHref}
          alt=""
        />
      </div>
    </main>
    // <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
    //   <div className="relative sm:pb-16 sm:pt-8">
    //     <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
    //       <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
    //         <div className="absolute inset-0">
    //           <img
    //             className="h-full w-full object-cover"
    //             src={doorHref}
    //             alt="Door of home in the evening"
    //           />
    //           <div className="absolute inset-0 bg-[color:rgba(27,167,254,0.5)] mix-blend-multiply" />
    //         </div>
    //         <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
    //           <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
    //             <span className="block uppercase text-blue-500 drop-shadow-md">
    //               Blues Stack
    //             </span>
    //           </h1>
    //           <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
    //             Check the README.md file for instructions on how to get this
    //             project deployed.
    //           </p>
    //           <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
    //             {user ? (
    //               <Link
    //                 to="/notes"
    //                 className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
    //               >
    //                 View Notes for {user.email}
    //               </Link>
    //             ) : (
    //               <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
    //                 <Link
    //                   to="/join"
    //                   className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
    //                 >
    //                   Sign up
    //                 </Link>
    //                 <Link
    //                   to="/login"
    //                   className="flex items-center justify-center rounded-md bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-600  "
    //                 >
    //                   Log In
    //                 </Link>
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </main>
  );
}
