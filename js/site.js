  /* 使用原生 dialog，支持 Escape、焦点约束和键盘关闭。 */
  (function () {
    var overlay = null;
    var previousFocus = null;
    var previousOverflow = '';
    function openLightbox(source) {
      if (overlay) overlay.close();
      previousFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      overlay = document.createElement('dialog');
      overlay.className = 'img-lightbox';
      overlay.setAttribute('aria-label', source.alt || '图片预览');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'img-lightbox__close';
      button.setAttribute('aria-label', '关闭图片预览');
      button.textContent = '×';
      var image = document.createElement('img');
      image.src = source.currentSrc || source.src;
      image.alt = source.alt || '';
      overlay.append(button, image);
      var current = overlay;
      current.addEventListener('click', function (event) {
        if (event.target === current || event.target === button) current.close();
      });
      current.addEventListener('close', function () {
        current.remove();
        overlay = null;
        document.body.style.overflow = previousOverflow;
        if (previousFocus) previousFocus.focus();
      }, { once: true });
      document.body.appendChild(current);
      document.body.style.overflow = 'hidden';
      current.showModal();
      button.focus();
    }
    document.querySelectorAll('.post-body img').forEach(function (image) {
      if (image.closest('a, button')) return;
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', '放大图片：' + (image.alt || '正文配图'));
      image.addEventListener('click', function () { openLightbox(image); });
      image.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });
  })();


function interactions(){
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const toast = $('#m-toast');
  let toastTimer;
  function notify(message) {
    if (!toast) return;
    clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
  }
  $$('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      notify('邮箱已复制到剪贴板：' + email);
    } catch (_) {
      // Older browsers and denied clipboard access still offer a usable copy path.
      const input = document.createElement('textarea'); input.value = email;
      input.style.cssText = 'position:fixed;top:0;left:-9999px'; document.body.append(input);
      input.select(); let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) {}
      input.remove(); button.focus();
      notify(copied ? '邮箱已复制到剪贴板：' + email : '请手动复制邮箱：' + email);
    }
  }));
  const days = $('#m-running-days'), uptime = $('#m-uptime'), runtime = $('#site-runtime');
  function updateUptime() {
    const started = Date.parse((days || runtime)?.dataset.startedAt);
    if (!Number.isFinite(started)) { if(days) days.textContent = '暂未设置'; return; }
    const seconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
    const dayCount = Math.floor(seconds / 86400);
    if(runtime) runtime.textContent = '已记录 ' + dayCount + ' 天 · 时间的流逝，恰如此时此刻';
    if(days) days.textContent = dayCount + ' 天';
    if(uptime) uptime.textContent = '又走过 ' + Math.floor(seconds % 86400 / 3600) + ' 时 ' + Math.floor(seconds % 3600 / 60) + ' 分 ' + seconds % 60 + ' 秒';
  }
  const toggle=$('.m-theme-toggle');
  function updateToggle(){const dark=document.documentElement.dataset.mellowTheme==='dark';toggle.textContent=dark?'☀':'☾';toggle.setAttribute('aria-label',dark?'切换到浅色模式':'切换到深色模式');toggle.setAttribute('aria-pressed',String(dark));}
  updateToggle();toggle.addEventListener('click',()=>{const next=document.documentElement.dataset.mellowTheme==='dark'?'light':'dark';document.documentElement.dataset.mellowTheme=next;try{localStorage.setItem('mellow-theme',next);}catch(_){}updateToggle();});
  const search=$('#m-search-input'), results=$('#m-search-results'), entries=Array.from($('#m-search-data').content.children);
  if(search&&results){search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase();results.replaceChildren();results.hidden=!q;if(!q)return;const found=entries.filter(e=>e.dataset.search.toLocaleLowerCase().includes(q));if(!found.length){const p=document.createElement('p');p.textContent='还没有找到相关记录，换个关键词试试。';results.append(p);}found.forEach(e=>{const copy=e.cloneNode(true);copy.removeAttribute('data-search');results.append(copy);});});
  search.addEventListener('keydown',e=>{if(e.key==='Escape'){search.value='';results.hidden=true;}});}
  let today='';function tick(){const now=new Date();$('#m-live-clock').textContent=now.toLocaleTimeString('zh-CN',{hour12:false});if(today===now.toDateString())return;today=now.toDateString();$('#m-live-date').textContent=now.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});$('#m-calendar-title').textContent=now.getFullYear()+' 年 '+(now.getMonth()+1)+' 月';const grid=$('#m-calendar-days');grid.replaceChildren();['日','一','二','三','四','五','六'].forEach(day=>{const el=document.createElement('span');el.className='m-weekday';el.textContent=day;grid.append(el);});for(let i=0;i<new Date(now.getFullYear(),now.getMonth(),1).getDay();i++)grid.append(document.createElement('span'));for(let d=1;d<=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();d++){const el=document.createElement('span');el.textContent=d;if(d===now.getDate()){el.className='m-today';el.setAttribute('aria-current','date');}grid.append(el);}}
  function updateClock(){updateUptime();if($('#m-live-clock'))tick();}
  updateClock();setInterval(updateClock,1000);
  const right=$('.m-right'),content=$('.content-wrap'),card=$('.m-music'),narrow=matchMedia('(max-width:1100px)');
  function placePlayer(){if(!right||!content||!card)return;const target=narrow.matches?content:right;if(card.parentElement!==target)target.prepend(card);}
  placePlayer();narrow.addEventListener('change',placePlayer);
  const tracks=[{id:'25954386',title:'紫丁香',artist:'拉赫玛尼诺夫'},{id:'26883027',title:'Arioso for Brass',artist:'Johann Sebastian Bach'},{id:'1314610409',title:'钟 · La Campanella',artist:'Franz Liszt / Yenlin'}];
  const audio=$('#m-audio'),seek=$('.m-player-seek'),play=$('[data-audio=play]'),status=$('.m-player-status'),list=$('.m-track-list');let current=0;
  const format=t=>Number.isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'—:—';
  function setTrack(index){current=(index+tracks.length)%tracks.length;const track=tracks[current];audio.src='https://music.163.com/song/media/outer/url?id='+track.id+'.mp3';$('#m-track-title').textContent=track.title;$('#m-track-artist').textContent=track.artist;status.textContent='给阅读配一点古典乐。';seek.value=0;$('#m-audio-current').textContent='0:00';$('#m-audio-duration').textContent='—:—';list.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',String(i===current)));}
  async function start(){status.textContent='音乐正在加载…';try{await audio.play();status.textContent='正在播放 · '+tracks[current].title;}catch(_){status.textContent='暂时无法播放，可换一首或在网易云收听。';}}
  tracks.forEach((track,i)=>{const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=track.title;button.addEventListener('click',()=>{setTrack(i);start();});li.append(button);list.append(li);});setTrack(0);
  play.addEventListener('click',()=>audio.paused?start():audio.pause());
  $('[data-audio=prev]').addEventListener('click',()=>{setTrack(current-1);start();});$('[data-audio=next]').addEventListener('click',()=>{setTrack(current+1);start();});
  $('[data-audio=repeat]').addEventListener('click',e=>{audio.loop=!audio.loop;e.currentTarget.setAttribute('aria-pressed',String(audio.loop));});
  $('[data-audio=list]').addEventListener('click',e=>{list.hidden=!list.hidden;e.currentTarget.setAttribute('aria-expanded',String(!list.hidden));e.currentTarget.setAttribute('aria-label',list.hidden?'展开播放列表':'收起播放列表');});
  audio.addEventListener('play',()=>{play.textContent='Ⅱ';play.setAttribute('aria-label','暂停音乐');$('.m-record').classList.add('playing');});
  audio.addEventListener('pause',()=>{play.textContent='▶';play.setAttribute('aria-label','播放音乐');$('.m-record').classList.remove('playing');status.textContent='已暂停';});
  audio.addEventListener('timeupdate',()=>{if(Number.isFinite(audio.duration)){seek.value=audio.currentTime/audio.duration*100;$('#m-audio-current').textContent=format(audio.currentTime);}});
  audio.addEventListener('loadedmetadata',()=>$('#m-audio-duration').textContent=format(audio.duration));
  audio.addEventListener('error',()=>{status.textContent='这首曲目暂不可播放，可切换或在网易云收听。';$('.m-record').classList.remove('playing');});
  audio.addEventListener('ended',()=>{if(!audio.loop){setTrack(current+1);start();}});
  seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(seek.value)/100;});
  const moments=$('[data-community-page=moments]');
  if(moments){let month='';const input=moments.querySelector('input'),items=Array.from(moments.querySelectorAll('.m-moment')),empty=moments.querySelector('.m-empty');function filter(){const q=input.value.trim().toLocaleLowerCase();let count=0;items.forEach(item=>{item.hidden=!!((month&&item.dataset.month!==month)||!item.textContent.toLocaleLowerCase().includes(q));if(!item.hidden)count++;});empty.hidden=count>0;}input.addEventListener('input',filter);moments.querySelectorAll('[data-month][type=button]').forEach(button=>button.addEventListener('click',()=>{month=button.dataset.month;moments.querySelectorAll('[data-month][type=button]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter();}));}
  const photos=$('[data-community-page=photos]');
  if(photos){
    const cards=Array.from(photos.querySelectorAll('.m-photo-card')),anchors=Array.from(photos.querySelectorAll('.m-photo-open')),filters=Array.from(photos.querySelectorAll('[data-photo-filter]')),dialog=$('#m-photo-viewer'),full=$('#m-photo-full'),error=$('#m-photo-error');let group=[],index=0,previousFocus=null;
    filters.forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.photoFilter;let count=0;cards.forEach(card=>{card.hidden=!!category&&card.dataset.photoCategory!==category;if(!card.hidden)count++;});filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));photos.querySelector('.m-photo-count').textContent=category?count+' / '+cards.length+' 张照片':'共 '+count+' 张照片';photos.querySelector('.m-empty').hidden=count>0;}));
    function showPhoto(){const anchor=group[index];error.hidden=true;full.src=anchor.href;full.alt=anchor.dataset.photoTitle;$('#m-photo-viewer-title').textContent=anchor.dataset.photoTitle;$('#m-photo-details').textContent=anchor.dataset.photoDetails;$('#m-photo-position').textContent=(index+1)+' / '+group.length;$('#m-photo-original').href=anchor.href;dialog.querySelectorAll('[data-photo-step]').forEach(button=>button.disabled=group.length<2);}
    function step(delta){if(group.length){index=(index+delta+group.length)%group.length;showPhoto();}}
    anchors.forEach(anchor=>anchor.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||typeof dialog.showModal!=='function')return;event.preventDefault();previousFocus=anchor;group=anchors.filter(a=>!a.closest('.m-photo-card').hidden);index=group.indexOf(anchor);showPhoto();if(!dialog.open)dialog.showModal();document.body.classList.add('m-photo-viewer-open');}));
    dialog.querySelectorAll('[data-photo-step]').forEach(button=>button.addEventListener('click',()=>step(Number(button.dataset.photoStep))));
    dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}});
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{document.body.classList.remove('m-photo-viewer-open');if(previousFocus)previousFocus.focus();});
    full.addEventListener('error',()=>error.hidden=false);full.addEventListener('load',()=>error.hidden=true);
  }
  const book=$('[data-community-page=guestbook]');
  if(book){const api=document.body.dataset.communityApi,form=book.querySelector('form'),state=$('#m-comments-state'),notes=$('#m-notes'),text=$('#m-comment-content'),submit=form.querySelector('[type=submit]'),message=$('.m-comment-status');text.addEventListener('input',()=>$('.m-comment-counter').textContent=text.value.length+' / 500');
    async function load(){state.hidden=false;state.textContent='正在读取留言…';try{if(!api)throw new Error('留言服务还在准备中，请稍后再来。');const response=await fetch(api+'/api/comments',{credentials:'omit'});if(!response.ok)throw new Error('暂时无法读取留言，请稍后重试。');const data=await response.json();notes.replaceChildren();$('#m-comment-total').textContent='已留下 '+data.total+' 张便签';const colors=['#fff5d8','#f8e6dd','#e9efdf','#e8edf5'];data.items.forEach((item,index)=>{const article=document.createElement('article');article.className='m-note-card';article.style.setProperty('--note',colors[index%colors.length]);const p=document.createElement('p');p.textContent=item.content;const footer=document.createElement('footer'),name=document.createElement('strong'),time=document.createElement('time');name.textContent=item.nickname||item.visitorLabel;time.dateTime=item.createdAt;time.textContent=new Date(item.createdAt).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});footer.append(name,time);article.append(p,footer);notes.append(article);});state.hidden=data.items.length>0;if(!data.items.length)state.textContent='还没有便签，来留下第一声问候吧。';}catch(error){state.textContent=error.message;$('#m-comment-total').textContent='留言墙';const retry=document.createElement('button');retry.className='m-retry';retry.type='button';retry.textContent='重试';retry.addEventListener('click',load);state.append(document.createElement('br'),retry);}}
    form.addEventListener('submit',async event=>{event.preventDefault();if(!api){message.textContent='留言服务还在准备中，请稍后再来。';return;}submit.disabled=true;message.textContent='正在收好你的便签…';try{const response=await fetch(api+'/api/comments',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify({nickname:$('#m-comment-name').value.trim(),content:text.value.trim(),website:form.elements.website.value})});const data=await response.json();if(!response.ok)throw new Error(data.error||'留言没有送达，请稍后重试。');text.value='';$('.m-comment-counter').textContent='0 / 500';message.textContent='便签已收到，审核后会出现在留言墙。';await load();}catch(error){message.textContent=error.message;}finally{submit.disabled=false;}});load();
  }
  const toc=$('.m-toc');
  if(toc){
    const links=Array.from(toc.querySelectorAll('a.nav-link'));
    const sections=links.map(link=>{try{return document.getElementById(decodeURIComponent(link.hash.slice(1)));}catch(_){return null;}});
    let queued=false;
    function highlight(){queued=false;let current=0;sections.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top<=120)current=i;});if(innerHeight+scrollY>=document.documentElement.scrollHeight-2)current=links.length-1;links.forEach((link,i)=>link.classList.toggle('active',i===current));}
    addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(highlight);}},{passive:true});highlight();
  }
}
interactions();
