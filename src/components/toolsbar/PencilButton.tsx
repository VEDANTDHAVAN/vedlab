import IconButton from "./IconButton";

export default function PencilButton({
    isActive, onClick
}:{
    isActive: boolean; 
    onClick: () => void;
}){
  return (
   <IconButton isActive={isActive} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black">
     <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
    </svg>
   </IconButton>
   )
}