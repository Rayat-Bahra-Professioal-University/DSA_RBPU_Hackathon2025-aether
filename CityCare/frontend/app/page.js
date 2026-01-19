"use client";

import Button from "./UiLib/Button";
import { useRouter } from "next/navigation";
import Navbar from "./UiLib/Navbar";
// import Main from "./UiLib/Main";
import Hero from "./UiLib/Hero";
export default function Home(){

  return(
    <div className="bg-white">
      <Navbar/>   
      <Hero/>
    </div>
  )
  
}