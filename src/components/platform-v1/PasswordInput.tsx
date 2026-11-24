"use client";
import {useState, type InputHTMLAttributes} from "react";
import v from "./presentation.module.css";

export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
 const [visible,setVisible]=useState(false);
 return <span className={v.passwordInput}>
  <input {...props} type={visible?"text":"password"}/>
  <button type="button" className={v.passwordToggle} disabled={props.disabled} aria-label={visible?"Ocultar contraseña":"Mostrar contraseña"} aria-pressed={visible} aria-controls={props.id} onClick={()=>setVisible(value=>!value)}>
   <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{visible&&<path d="m3 3 18 18"/>}</svg>
  </button>
 </span>;
}
