(function(){
  "use strict";
  const programs=window.AMC_PROGRAMS||{};
  const template=window.AMC_DAY_TEMPLATE||[];
  const failedVideoIds=new Set();
  const $=id=>document.getElementById(id);
  const els={clock:$("stationClock"),title:$("nowTitle"),meta:$("nowMeta"),time:$("programTime"),player:$("player"),card:$("stationCard"),cardTitle:$("stationCardTitle"),enter:$("enterButton"),live:$("liveButton"),start:$("startOverButton"),rewind:$("rewindButton"),share:$("shareButton"),shareStatus:$("shareStatus"),guide:$("guideRows"),next:$("nextCards"),progress:$("progressBar"),position:$("positionLabel")};

  let player=null,playerReady=false,apiRequested=false,entered=false,loadedKey="",scheduleKey="",schedule=[];
  let mode="live",shiftBaseMs=0,shiftStartedMs=0;

  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return h>>>0;}
  function dayKey(ms){const d=new Date(ms);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function dayStart(ms){const d=new Date(ms);return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();}
  function chooseDistinct(choices,key,index,previousId){if(!choices.length)return null;const start=hash(`amc:${key}:${index}`)%choices.length;for(let i=0;i<choices.length;i++){const k=choices[(start+i)%choices.length],item=programs[k];if(item&&item.id!==previousId&&item.videoId&&!failedVideoIds.has(item.videoId))return k;}return choices[start];}
  function buildSchedule(ms){
    const key=dayKey(ms),start=dayStart(ms);let previousId="";
    return template.map((slot,index)=>{
      const chosen=chooseDistinct(slot.choices||[],key,index,previousId),item=programs[chosen];if(!item)return null;previousId=item.id;
      return {id:`${key}-${index}`,movie:item,startsAtMs:start+slot.minute*60000,endsAtMs:start+(slot.minute+slot.duration)*60000,blockSeconds:slot.duration*60,type:slot.type||"movie"};
    }).filter(Boolean);
  }
  function ensureSchedule(ms){const key=dayKey(ms);if(key!==scheduleKey){scheduleKey=key;schedule=buildSchedule(ms);renderGuide();}}
  function currentClock(){return mode==="live"?Date.now():shiftBaseMs+(Date.now()-shiftStartedMs);}
  function resolve(ms){ensureSchedule(ms);let block=schedule.find(x=>ms>=x.startsAtMs&&ms<x.endsAtMs)||schedule[0];if(!block)return null;const elapsed=Math.max(0,Math.floor((ms-block.startsAtMs)/1000)),runtime=Math.min(block.movie.runtimeSeconds||block.blockSeconds,block.blockSeconds);return {block,elapsed,runtime,mediaSeconds:Math.min(elapsed,Math.max(0,runtime-1)),programActive:elapsed<runtime};}
  function fmt(ms){return new Date(ms).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});}
  function art(item){return item&&item.videoId?`https://i.ytimg.com/vi/${item.videoId}/maxresdefault.jpg`:"";}
  function renderGuide(){if(!schedule.length)return;els.guide.innerHTML=schedule.map(b=>`<article class="guide-row" data-id="${b.id}"><time>${fmt(b.startsAtMs)}</time><div><strong>${b.movie.title}</strong><span>${b.movie.year} · ${b.movie.collection}</span></div></article>`).join("");}
  function renderNext(block){const i=schedule.findIndex(x=>x.id===block.id);els.next.innerHTML=[1,2,3].map(step=>{const b=schedule[(i+step)%schedule.length];return `<article class="next-card" style="--card-art:url('${art(b.movie)}')"><time>${fmt(b.startsAtMs)}</time><strong>${b.movie.title}</strong><span>${b.movie.year} · ${b.movie.collection}</span></article>`;}).join("");}
  function showStation(message){els.card.hidden=false;els.cardTitle.textContent=message||"AMC intermission — next classic starts on schedule";if(els.player)els.player.style.visibility="hidden";}
  function showPlayer(){els.card.hidden=true;if(els.player)els.player.style.visibility="visible";}
  function loadApi(){if(apiRequested||playerReady)return;apiRequested=true;if(window.YT&&window.YT.Player){window.onYouTubeIframeAPIReady();return;}const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);}
  function sync(force){
    const state=resolve(currentClock());if(!state)return;const {block}=state;
    els.clock.textContent=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit",second:"2-digit"});els.title.textContent=block.movie.title;els.meta.textContent=`AMC CLASSIC MOVIES · ${block.movie.year} · ${block.movie.collection}`;els.time.textContent=`${fmt(block.startsAtMs)}–${fmt(block.endsAtMs)}`;document.body.style.setProperty("--program-art",`url('${art(block.movie)}')`);renderNext(block);els.progress.style.width=`${Math.min(100,(state.elapsed/block.blockSeconds)*100)}%`;els.position.textContent=mode==="live"?"Synced to the shared AMC channel clock":"Time shifted";
    document.querySelectorAll(".guide-row").forEach(r=>r.classList.toggle("current",r.dataset.id===block.id));
    try{localStorage.setItem("infinity_live_AMC",JSON.stringify({title:block.movie.title,startsAtMs:block.startsAtMs,endsAtMs:block.endsAtMs,updatedAt:Date.now()}));}catch(_){}
    if(!state.programActive){showStation();return;}if(!entered)return;if(!playerReady){loadApi();return;}showPlayer();
    const key=`${block.id}:${block.movie.videoId}`;if(force||loadedKey!==key){loadedKey=key;player.loadVideoById({videoId:block.movie.videoId,startSeconds:state.mediaSeconds});player.setVolume(100);return;}if(mode==="live"&&player.getPlayerState()===YT.PlayerState.PLAYING){const drift=state.mediaSeconds-player.getCurrentTime();if(Math.abs(drift)>5)player.seekTo(state.mediaSeconds,true);}
  }
  function enter(){entered=true;els.enter.hidden=true;loadApi();sync(true);}function joinLive(){mode="live";loadedKey="";sync(true);}function startOver(){const state=resolve(Date.now());if(!state)return;mode="timeshift";shiftBaseMs=state.block.startsAtMs;shiftStartedMs=Date.now();loadedKey="";sync(true);}function rewind(){mode="timeshift";shiftBaseMs=currentClock()-30000;shiftStartedMs=Date.now();loadedKey="";sync(true);}
  async function share(){const state=resolve(Date.now()),title=state?state.block.movie.title:"AMC Classic Movies";const payload={title:`${title} · AMC Classic Movies`,text:`Watch ${title} on the synchronized AMC classic movie channel.`,url:location.href};try{if(navigator.share)await navigator.share(payload);else await navigator.clipboard.writeText(location.href);window.dispatchEvent(new CustomEvent("infinity:share",{detail:{channel:"AMC",title,reward:0.1}}));const n=Number(localStorage.getItem("infinity_amc_shares")||0)+1;localStorage.setItem("infinity_amc_shares",String(n));els.shareStatus.textContent=`Shared · ${n%10}/10 toward next Star Coin`;}catch(e){if(!e||e.name!=="AbortError")els.shareStatus.textContent="Share unavailable";}}

  window.onYouTubeIframeAPIReady=function(){player=new YT.Player("player",{width:"100%",height:"100%",playerVars:{playsinline:1,controls:1,rel:0,enablejsapi:1},events:{onReady:()=>{playerReady=true;if(entered)sync(true);},onError:()=>{const state=resolve(currentClock());if(state&&state.block.movie.videoId)failedVideoIds.add(state.block.movie.videoId);scheduleKey="";loadedKey="";ensureSchedule(Date.now());showStation("Source unavailable — skipped, not replaced by a trailer or clip");setTimeout(()=>sync(true),250);}}});};
  els.enter.addEventListener("click",enter);els.live.addEventListener("click",joinLive);els.start.addEventListener("click",startOver);els.rewind.addEventListener("click",rewind);els.share.addEventListener("click",share);
  ensureSchedule(Date.now());sync(false);loadApi();setInterval(()=>sync(false),1000);
})();