import type { User } from "@prisma/client";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { deleteInvitation, shareRoom } from "~/app/actions/rooms";
import UserAvatar from "./UserAvatar";

export default function SharedMenu({roomId, othersWithAccessToRoom}:{
  roomId: string, othersWithAccessToRoom: User[],
}){
 const [isOpen, setIsOpen] = useState(false);
 const [email, setEmail] = useState("");
 const [error, setError] = useState<string | undefined>(undefined);

 const inviteUser = async () => {
  const error = await shareRoom(roomId, email);
  setError(error);
 };
  
 return (
    <div >
      <button onClick={() => setIsOpen(true)}
      className="h-fit w-fit bg-blue-400 px-4 py-2 text-[12px] text-white rounded-md cursor-pointer"
      >Share</button>
     {isOpen && <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
       <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-3 py-2">
          <h2 className="text-[14px] font-semibold">Share this File</h2> 
          <IoClose className="h-6 w-6 cursor-pointer" onClick={() => setIsOpen(false)}/>
        </div>
        <div className="border-b border-gray-200" />
        <div className="space-y-3 p-4">
         <div className="flex h-8 items-center space-x-2">
          <input type="text" placeholder="Invite Others by Email" value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="h-full w-full rounded-md border border-gray-300 px-3 text-sm
             placeholder:text-gray-600 focus:outline-none focus:border-black"
          />
           <button onClick={inviteUser} className="h-full rounded-md bg-[#0c8ce9] text-[12px] px-3 py-2 text-white">Share</button>
         </div>
         {error && <p className="text-[12px] text-red-500">{error}</p>}
         <p className="text-[12px] text-gray-500">Who all have access</p>
         <ul>
          {othersWithAccessToRoom.map((user, index) => (
            <li className="flex items-center justify-between py-1" key={index}>
              <div className="flex items-center space-x-2">
               <UserAvatar name={user.email ?? "Anonymous"} className="h-6 w-6"/>
               <span className="text-[12px]">{user.email}</span>
              </div>
              <div className="flex items-center space-x-1">
               <span className="text-[12px] text-gray-500">Full Access</span>
               <IoClose className="h-4 w-4 cursor-pointer text-gray-500" 
                 onClick={() => deleteInvitation(roomId, user.email)}
               />
              </div>
            </li>
          ))}
         </ul>
        </div>
       </div>
      </div>}
    </div>
 )
}