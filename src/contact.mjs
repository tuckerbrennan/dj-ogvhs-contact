const form=document.getElementById('contact-form');
const type=document.getElementById('request-type');
const subject=document.getElementById('subject');
const message=document.getElementById('message');
const button=form.querySelector('button[type="submit"]');
const status=document.getElementById('contact-status');
const allowed=['Booking','Press Inquiries','Partnerships','Other'];
let endpoint=null;
function updateSubject(){document.getElementById('email-subject').value='[DJ OGVHS]['+(allowed.includes(type.value)?type.value:'Other')+'] '+subject.value.trim().replace(/[\r\n]/g,' ');}
for(const field of [subject,message])field.addEventListener('input',()=>field.setCustomValidity(field.value.trim()?'':'Please fill out this field.'));
for(const field of [type,subject])field.addEventListener('input',updateSubject);
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!endpoint)return;
  if(!allowed.includes(type.value)||!subject.value.trim()||!message.value.trim()){status.textContent='Please choose a request type and fill out the subject and message.';return;}
  updateSubject();button.disabled=true;status.textContent='Sending your message…';
  try{
    const response=await fetch(endpoint,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error('not accepted');
    form.reset();status.textContent='Message submitted. Thanks for getting in touch. Tucker will reply using the email you provided.';
  }catch{status.textContent='Your message could not be submitted. Please try again or email ogvhstape@gmail.com. Your message is still here.';}
  finally{button.disabled=false;}
});
try{
 const response=await fetch('./contact-config.json',{cache:'no-store'});
 const config=await response.json();
 if(typeof config.endpoint==='string'&&/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(config.endpoint)){
  endpoint=config.endpoint;button.disabled=false;status.textContent='';
 }
}catch{/* Direct email and telephone links remain available. */}
