const form=document.getElementById('contact-form');
const type=document.getElementById('request-type');
const subject=document.getElementById('subject');
const message=document.getElementById('message');
const button=form.querySelector('button[type="submit"]');
const status=document.getElementById('contact-status');
const allowed=['Booking','Press Inquiries','Partnerships','Other'];
let endpoint=null,provider='formspree',submissionId=null,lastPayload=null;
function updateSubject(){document.getElementById('email-subject').value='[DJ OGVHS]['+(allowed.includes(type.value)?type.value:'Other')+'] '+subject.value.trim().replace(/[\r\n]/g,' ');}
for(const field of [subject,message])field.addEventListener('input',()=>field.setCustomValidity(field.value.trim()?'':'Please fill out this field.'));
for(const field of [type,subject])field.addEventListener('input',updateSubject);
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!endpoint)return;
  if(!allowed.includes(type.value)||!subject.value.trim()||!message.value.trim()){status.textContent='Please choose a request type and fill out the subject and message.';return;}
  updateSubject();button.disabled=true;status.textContent='Sending your message…';
  try{
    const fields=new FormData(form);
    let body=fields,headers={Accept:'application/json'};
    if(provider==='aws'){
      const payload={requestType:type.value,name:fields.get('name')||'',email:fields.get('email'),subject:subject.value,message:message.value,website:fields.get('_gotcha')||''};
      const fingerprint=JSON.stringify(payload);
      if(fingerprint!==lastPayload){submissionId=crypto.randomUUID();lastPayload=fingerprint;}
      body=JSON.stringify({...payload,submissionId});headers['Content-Type']='application/json';
    }
    const response=await fetch(endpoint,{method:'POST',body,headers,signal:AbortSignal.timeout(20000)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||(provider==='aws'&&result.accepted!==true))throw Error(result.error||'Your message could not be submitted. Please try again or email ogvhstape@gmail.com. Your message is still here.');
    form.reset();submissionId=null;lastPayload=null;status.textContent='Message submitted. Thanks for getting in touch. Tucker will reply using the email you provided.';
  }catch(error){status.textContent=(error instanceof TypeError||['AbortError','TimeoutError'].includes(error.name))?'Your message could not be submitted. Please try again or email ogvhstape@gmail.com. Your message is still here.':error.message;}
  finally{button.disabled=false;}
});
try{
 const response=await fetch('./contact-config.json',{cache:'no-store'});
 const config=await response.json();
 const aws=typeof config.endpoint==='string'&&/^https:\/\/[a-z0-9]+\.execute-api\.us-east-2\.amazonaws\.com\/v1\/contact$/.test(config.endpoint);
 const formspree=typeof config.endpoint==='string'&&/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(config.endpoint);
 if((config.provider==='aws'&&aws)||formspree){
  provider=config.provider==='aws'?'aws':'formspree';endpoint=config.endpoint;button.disabled=false;status.textContent='';
  if(provider==='aws')document.querySelector('.contact-notice').textContent='Your message and contact details will be sent privately to Tucker.';
 }
}catch{/* Direct email and telephone links remain available. */}
