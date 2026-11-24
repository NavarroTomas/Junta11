import {validateDraft} from "./domain";
import type {LeagueDraft} from "./types";
export const REGISTRATION_PROGRESS_KEY="gtl:registration:progress:v1";
export function canResumeRegistration(path:string, signedIn:boolean, draft:LeagueDraft, progress:unknown):boolean {
 if(path!=="/crear-liga" || !signedIn || validateDraft(draft))return false;
 if(!progress || typeof progress!=="object")return false;
 const saved=progress as Record<string,unknown>;
 return saved.version===1 && saved.requestId===draft.requestId && saved.questionsComplete===true;
}
export function normalizeEmail(value:string):string{return value.trim();}
export function registrationEmailError(value:string):string|null {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value)) ? null : "Revisá tu correo electrónico.";
}
