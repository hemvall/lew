// Prepare audio during the click; play feedback only after the server accepts.
export function prepareApprovalFeedback(){
  let audio;try{audio=new (window.AudioContext||window.webkitAudioContext)();void audio.resume();}catch{}
  return ()=>{
    const feedback=document.createElement('div');feedback.className='approval-feedback';feedback.setAttribute('role','status');const check=document.createElement('span');check.textContent='✓';const label=document.createElement('strong');label.textContent='Plan approuvé · Mission démarrée';feedback.append(check,label);document.body.append(feedback);setTimeout(()=>feedback.remove(),1800);
    if(audio){try{for(const [i,frequency] of [523.25,659.25,783.99].entries()){const oscillator=audio.createOscillator(),gain=audio.createGain(),time=audio.currentTime+i*.09;oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.055,time+.015);gain.gain.exponentialRampToValueAtTime(.001,time+.35);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(time);oscillator.stop(time+.38);}setTimeout(()=>void audio.close(),1000);}catch{void audio.close();}}
  };
}
