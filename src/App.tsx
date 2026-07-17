import React, { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { Plus, Download, Lock, Unlock, Check, Shield, ArrowLeft, Copy, Image as ImageIcon, AlertCircle, Crop, Wand2, Zap, X, Undo2, Redo2, Palette } from 'lucide-react';
import { DICTIONARIES, RTL_LANGUAGES, type Language } from './i18n';
import ImageCropper from './components/ImageCropper';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { UploadScreen } from './components/UploadScreen';
import { DownloadScreen } from './components/DownloadScreen';
import type { ProcessedImage, ResizeResult, PresetItem } from './types';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try { const s = localStorage.getItem('imgrunner.language') as Language | null; if (s && ['en','hi','es','pt','fr','id','ar'].includes(s)) return s; } catch {}
    const bl = (navigator.language || '').toLowerCase();
    if (bl.startsWith('hi')) return 'hi'; if (bl.startsWith('es')) return 'es'; if (bl.startsWith('pt')) return 'pt';
    if (bl.startsWith('fr')) return 'fr'; if (bl.startsWith('id')||bl.startsWith('ms')) return 'id'; if (bl.startsWith('ar')) return 'ar';
    return 'en';
  });
  const [theme, setTheme] = useState<'dark'|'light'>(() => {
    try { const s = localStorage.getItem('imgrunner-theme'); if (s==='light'||s==='dark') return s; } catch {}
    return window.matchMedia?.('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  });

  const [page, setPage] = useState<'upload'|'edit'|'done'>('upload');
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [results, setResults] = useState<ResizeResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [pendingPreset, setPendingPreset] = useState<PresetItem|null>(null);

  const ls = (k:string,d:any) => { try {const v=localStorage.getItem('ir.'+k);return v!==null?JSON.parse(v):d}catch{return d}};
  const ss = (k:string,v:any) => { try {localStorage.setItem('ir.'+k,JSON.stringify(v))}catch{} };
  const [width, setWidth] = useState(()=>ls('w',800));
  const [height, setHeight] = useState(()=>ls('h',600));
  const [unit, setUnit] = useState<'px'|'percent'|'cm'>(()=>ls('u','px'));
  const [format, setFormat] = useState<'jpg'|'png'|'webp'>(()=>ls('f','jpg'));
  const [quality, setQuality] = useState(()=>ls('q',90));
  const [lockRatio, setLockRatio] = useState(()=>ls('lr',true));
  const [origRatio, setOrigRatio] = useState(1.33);
  const [smartCompress, setSmartCompress] = useState(()=>ls('sc',false));
  const [targetKB, setTargetKB] = useState(()=>ls('tk',50));
  const [targetKBInput, setTargetKBInput] = useState(()=>String(ls('tk',50)));
  const [bgColor, setBgColor] = useState(()=>ls('bg','#ffffff'));
  useEffect(()=>{ss('w',width)},[width]); useEffect(()=>{ss('h',height)},[height]);
  useEffect(()=>{ss('u',unit)},[unit]); useEffect(()=>{ss('f',format)},[format]);
  useEffect(()=>{ss('q',quality)},[quality]); useEffect(()=>{ss('lr',lockRatio)},[lockRatio]);
  useEffect(()=>{ss('sc',smartCompress)},[smartCompress]); useEffect(()=>{ss('tk',targetKB)},[targetKB]);
  useEffect(()=>{ss('bg',bgColor)},[bgColor]);
  useEffect(()=>{setTargetKBInput(String(targetKB))},[targetKB]);

  const [history, setHistory] = useState<{width:number;height:number;quality:number;bgColor:string;format:string;unit:string;lockRatio:boolean;smartCompress:boolean;targetKB:number}[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const undoRef = useRef(false);
  const pushHistory = useCallback(() => {
    if (undoRef.current) { undoRef.current = false; return; }
    const state = {width,height,quality,bgColor,format,unit,lockRatio,smartCompress,targetKB};
    setHistory(prev => { const next = prev.slice(0, historyIdx + 1); next.push(state); if (next.length > 50) next.shift(); return next; });
    setHistoryIdx(prev => Math.min(prev + 1, 49));
  }, [width,height,quality,bgColor,format,unit,lockRatio,smartCompress,targetKB,historyIdx]);
  const undo = () => { if (historyIdx < 0 || !history.length) return; undoRef.current = true; const s = history[historyIdx]; setWidth(s.width); setHeight(s.height); setQuality(s.quality); setBgColor(s.bgColor); setFormat(s.format as any); setUnit(s.unit as any); setLockRatio(s.lockRatio); setSmartCompress(s.smartCompress); setTargetKB(s.targetKB); setHistoryIdx(prev => prev - 1); };
  const redo = () => { if (historyIdx >= history.length - 1) return; undoRef.current = true; const s = history[historyIdx + 1]; setWidth(s.width); setHeight(s.height); setQuality(s.quality); setBgColor(s.bgColor); setFormat(s.format as any); setUnit(s.unit as any); setLockRatio(s.lockRatio); setSmartCompress(s.smartCompress); setTargetKB(s.targetKB); setHistoryIdx(prev => prev + 1); };
  useEffect(() => { const t = setTimeout(() => pushHistory(), 300); return () => clearTimeout(t); }, [width,height,quality,bgColor,format,unit,lockRatio,smartCompress,targetKB]);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [sliderPos, setSliderPos] = useState(50);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [toast, setToast] = useState<{msg:string;error?:boolean}|null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<any>(null);
  const notify = useCallback((msg:string,error=false)=>{clearTimeout(toastTimer.current);setToast({msg,error});toastTimer.current=setTimeout(()=>setToast(null),3000);},[]);

  useEffect(() => { document.documentElement.classList.toggle('dark',theme==='dark'); localStorage.setItem('imgrunner-theme',theme); }, [theme]);
  useEffect(() => { document.documentElement.dir = ['ar'].includes(lang) ? 'rtl' : 'ltr'; localStorage.setItem('imgrunner.language',lang); }, [lang]);
  useEffect(() => {
    const img = images[activeIdx]||images[0]; if (!img) return;
    setOrigRatio(img.width/img.height);
    if (unit==='px') { setWidth(img.width); setHeight(img.height); }
    else if (unit==='percent') { setWidth(100); setHeight(100); }
    else { setWidth(Math.round(img.width/50)); setHeight(Math.round(img.height/50)); }
  }, [images, activeIdx, unit]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName==='INPUT'||(e.target as HTMLElement)?.tagName==='SELECT') return;
      if (e.ctrlKey||e.metaKey) {
        if (e.key==='o'||e.key==='O') { e.preventDefault(); fileInputRef.current?.click(); }
        if ((e.key==='e'||e.key==='E')&&images.length>0) setPage('edit');
        if ((e.key==='d'||e.key==='D')&&results.length>0) setPage('done');
        if (e.key==='z'||e.key==='Z') { e.preventDefault(); undo(); }
        if ((e.key==='Z'||e.key==='y'||e.key==='Y')&&e.shiftKey) { e.preventDefault(); redo(); }
      }
      if (e.key==='Escape') { if (isCropping) setIsCropping(false); else if (page==='done') resetAll(); else if (page==='edit') { setPage('upload'); setImages([]); } }
      if ((e.key==='Enter')&&page==='edit'&&images.length>0) startResize();
    };
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h);
  }, [page, images, results, isCropping, undo, redo]);

  const t = useCallback((key:string,params:any={})=>{
    let val:any = DICTIONARIES[lang]?.[key]??DICTIONARIES['en'][key]??key;
    if (typeof val==='function') val=val(params);
    let txt=String(val); Object.entries(params).forEach(([k,v])=>txt=txt.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`,'g'),String(v))); return txt;
  },[lang]);

  const estimatedSize = useCallback(() => {
    const img = images[activeIdx]||images[0]; if (!img) return '';
    let w=width, h=height;
    if (unit==='percent') { w=Math.round(img.width*width/100); h=Math.round(img.height*height/100); }
    else if (unit==='cm') { w=width*10; h=height*10; }
    const ratio = Math.max(0, (w*h)/(img.width*img.height));
    const estBytes = img.size*ratio*(format==='png'?1.2:format==='webp'?0.7:0.6)*(quality/100);
    const estKB = Math.round(estBytes/1024);
    return estKB>1024 ? `≈ ${(estKB/1024).toFixed(1)} MB` : `≈ ${estKB} KB`;
  }, [images, activeIdx, width, height, unit, format, quality]);

  const loadImages = useCallback(async (files: FileList|null) => {
    if (!files?.length) return;
    const MAX=50, MAXSIZE=25*1024*1024;
    const remaining = MAX-images.length;
    if (remaining<=0) { notify(t('alerts.maxImages',{max:MAX}), true); return; }
    const loaded:ProcessedImage[]=[];
    for (const f of Array.from(files).slice(0,remaining)) {
      const t=f.type.toLowerCase(); if (!t.startsWith('image/')||t==='image/svg+xml') continue;
      if (f.size>MAXSIZE) continue;
      try { loaded.push(await loadFile(f)); } catch {}
    }
    if (!loaded.length) { notify(t('alerts.noSupportedImages'), true); return; }
    setImages(prev=>[...prev,...loaded]);
    if (pendingPreset) { setWidth(pendingPreset.w); setHeight(pendingPreset.h); setOrigRatio(pendingPreset.w/pendingPreset.h); setPendingPreset(null); }
    else { const f=loaded[0]; setOrigRatio(f.width/f.height); setWidth(f.width); setHeight(f.height); }
    setActiveIdx(images.length); setPage('edit');
    notify(t('alerts.imagesLoaded',{count:loaded.length}));
  }, [images.length, pendingPreset, t, notify]);

  const loadFile = (file:File):Promise<ProcessedImage> => new Promise((res,rej)=>{
    const url=URL.createObjectURL(file); const img=new Image();
    img.onload=()=>{if(img.naturalWidth&&img.naturalHeight)res({id:crypto.randomUUID()||Math.random().toString(36).slice(2,11),file,name:file.name,size:file.size,width:img.naturalWidth,height:img.naturalHeight,url,type:file.type});else{URL.revokeObjectURL(url);rej()}};
    img.onerror=()=>{URL.revokeObjectURL(url);rej()}; img.src=url;
  });

  const onW = (v:number) => { setWidth(v); if (lockRatio) setHeight(Math.max(1, Math.round(unit==='percent'?v:(v/origRatio)))); };
  const onH = (v:number) => { setHeight(v); if (lockRatio) setWidth(Math.max(1, Math.round(unit==='percent'?v:(v*origRatio)))); };
  const removeImage = (id:string) => { setImages(prev=>{const idx=prev.findIndex(i=>i.id===id);const n=prev.filter(i=>i.id!==id);if(!n.length){setPage('upload');setActiveIdx(0)}else if(idx<=activeIdx)setActiveIdx(Math.max(0,activeIdx-1));return n}) };

  const [dragIdx, setDragIdx] = useState<number|null>(null);
  const moveImage = (from:number,to:number) => { setImages(prev=>{const arr=[...prev];const[m]=arr.splice(from,1);arr.splice(to,0,m);return arr}); setDragIdx(null); };

  const startResize = useCallback(async()=>{
    if(!images.length)return; abortRef.current?.abort();
    const ac=new AbortController(); abortRef.current=ac;
    results.forEach(r=>URL.revokeObjectURL(r.url)); setResults([]);
    setProcessing(true); setProgress(5); setProgressText(t('processing.resizing'));
    const all:ResizeResult[]=[];
    for(let i=0;i<images.length;i++){if(ac.signal.aborted)break;setProgress(Math.round(((i+1)/images.length)*100));setProgressText(t('processing.progress',{current:i+1,total:images.length}));try{all.push(await processImg(images[i],i))}catch(err:any){if(err.name!=='AbortError')notify(`⚠️ ${images[i].name}: ${err.message}`,true)}}
    if(!ac.signal.aborted){setResults(all);setProcessing(false);setPage('done');notify(all.length>0?t('alerts.imagesDone',{count:all.length}):t('alerts.nothingProcessed'),all.length===0)}
  },[images,width,height,unit,format,quality,bgColor,smartCompress,targetKB,t,notify]);

  const processImg = (img:ProcessedImage,idx:number):Promise<ResizeResult>=>new Promise((res,rej)=>{
    const mime=format==='jpg'?'image/jpeg':format==='png'?'image/png':'image/webp';
    let nw=width,nh=height;
    if(unit==='percent'){nw=Math.round(img.width*width/100);nh=Math.round(img.height*height/100)}
    else if(unit==='cm'){nw=Math.round(width*(img.width/Math.max(img.width,img.height))*10);nh=Math.round(height*(img.height/Math.max(img.width,img.height))*10)}
    nw=Math.max(1,Math.min(12000,nw));nh=Math.max(1,Math.min(12000,nh));
    if(nw*nh>60000000){rej(new Error(t('alerts.tooLarge',{maxDimension:12000,megapixels:60})));return}
    const c=document.createElement('canvas');c.width=nw;c.height=nh;
    const ctx=c.getContext('2d',{alpha:format!=='jpg'});if(!ctx){rej(new Error(t('alerts.canvasUnavailable')));return}
    const el=new Image();
    el.onload=async()=>{
      ctx.fillStyle=bgColor||'#fff';ctx.fillRect(0,0,nw,nh);
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(el,0,0,nw,nh);
      let fb:Blob|null=null;let fq=quality;
      if(smartCompress&&(format==='jpg'||format==='webp')){
        const tb=targetKB*1024;let lo=5,hi=100;let b:Blob|null=null,bq=90;let cl:Blob|null=null,cq=90;
        for(let s=0;s<8;s++){const mid=Math.floor((lo+hi)/2);const bl=await toBlob(c,mime,mid/100);if(!bl)continue;if(!cl||Math.abs(bl.size-tb)<Math.abs(cl.size-tb)){cl=bl;cq=mid}if(bl.size<=tb){b=bl;bq=mid;lo=mid+1}else{hi=mid-1}}
        fb=b||cl;fq=b?bq:cq;
      }else{fb=await toBlob(c,mime,quality/100)}
      if(!fb){rej(new Error(t('alerts.formatUnsupported')));return}
      const name=img.name.replace(/\.[^/.]+$/,'').replace(/[^a-z0-9_-]/gi,'-');
      res({id:img.id,fileName:`${String(idx+1).padStart(2,'0')}-${name}_${nw}x${nh}.${format}`,blob:fb,url:URL.createObjectURL(fb),originalWidth:img.width,originalHeight:img.height,newWidth:nw,newHeight:nh,originalName:img.name,originalSize:img.size,newSize:fb.size,qualityUsed:(format==='jpg'||format==='webp')?fq:null,targetSizeUsed:smartCompress});
    };
    el.onerror=()=>rej(new Error(t('alerts.resizeError')));el.src=img.url;
  });

  const toBlob = (c:HTMLCanvasElement,m:string,q:number):Promise<Blob|null>=>new Promise(r=>c.toBlob(b=>r(b),m,q));

  const downloadSingle=(r:ResizeResult)=>{const a=document.createElement('a');a.href=r.url;a.download=r.fileName;a.click()};
  const downloadAll=async()=>{if(!results.length)return;if(results.length===1){downloadSingle(results[0]);return}setProcessing(true);setProgress(10);setProgressText(t('processing.packaging'));const z=new JSZip();results.forEach(r=>z.file(r.fileName,r.blob));try{const c=await z.generateAsync({type:'blob'},m=>setProgress(Math.round(m.percent)));const a=document.createElement('a');a.href=URL.createObjectURL(c);a.download=`images-${new Date().toISOString().split('T')[0]}.zip`;a.click()}catch{notify(t('alerts.zipFailed'),true)}finally{setProcessing(false)}};

  const formatSize=(b:number)=>{if(b<=0)return'0 B';const k=1024;const i=Math.floor(Math.log(b)/Math.log(k));return parseFloat((b/Math.pow(k,i)).toFixed(1))+' '+['B','KB','MB','GB'][i]};

  const resetAll=()=>{images.forEach(i=>URL.revokeObjectURL(i.url));results.forEach(r=>URL.revokeObjectURL(r.url));setImages([]);setResults([]);setActiveIdx(0);setPage('upload')};

  const handleCropSave=(blob:Blob,url:string,w:number,h:number)=>{if(!activeImage)return;const u=[...images];u[activeIdx]={...activeImage,file:new File([blob],activeImage.name,{type:blob.type}),url,width:w,height:h,size:blob.size};setImages(u);setIsCropping(false);notify(t('editor.cropSaved'))};

  const activeImage = images[activeIdx]||images[0];
  const activeResult = results.find(r=>r.id===(selectedResultId??activeImage?.id));
  const handleSelectResult = useCallback((resultId:string)=>{
    setSelectedResultId(resultId);
    const imgIdx = images.findIndex(i=>i.id===resultId);
    if (imgIdx>=0) setActiveIdx(imgIdx);
  }, [images]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${theme==='dark'?'bg-[#0d0d0e] text-[#e3e3e3]':'bg-[#f8f9fa] text-[#1f1f1f]'}`}>
      {toast&&(
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-scale-in backdrop-blur-md ${toast.error?'bg-red-500/90 text-white':'bg-[#1a73e8]/90 text-white'}`}>
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={e=>loadImages(e.target.files)} />

      <Header theme={theme} setTheme={setTheme} lang={lang} setLang={setLang}
        activePage={page} setActivePage={setPage as any} resetAll={resetAll} t={t} />

      <main className="flex-1 w-full flex flex-col">
        {page==='upload'&&(
          <UploadScreen theme={theme} lang={lang} t={t}
            handleFilesSelected={loadImages} handlePresetClick={p=>{setPendingPreset(p);document.getElementById('file-input-main')?.click()}} />
        )}

        {page==='edit'&&(
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className={`flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto ${theme==='dark'?'bg-[#131314]':'bg-[#f0f4f9]'}`}>
              {images.length>1&&(
                <div className={`flex gap-2 mb-4 p-3 rounded-2xl border overflow-x-auto ${theme==='dark'?'bg-[#1e1f20]/50 border-[#2d2f31]':'bg-white border-[#dadce0]'}`}>
                  {images.map((img,idx)=>(
                    <div key={img.id} className="relative flex-shrink-0 group" draggable onDragStart={()=>setDragIdx(idx)} onDragOver={e=>{e.preventDefault();if(dragIdx!==null&&dragIdx!==idx)moveImage(dragIdx,idx)}}>
                      <button onClick={()=>setActiveIdx(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${idx===activeIdx?'border-[#1a73e8] scale-105 shadow-md':'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={img.url} alt="" className="w-full h-full object-cover" draggable={false} />
                      </button>
                      <button onClick={()=>removeImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={`flex-1 flex flex-col p-6 rounded-3xl border min-h-[400px] ${theme==='dark'?'bg-[#1e1f20]/30 border-[#2d2f31]':'bg-white border-[#dadce0]'}`}>
                {activeImage?(
                  <>
                    <div className="w-full flex-1 flex items-center justify-center max-h-[400px] relative">
                      <img src={activeImage.url} alt={activeImage.name}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-sm select-none" />
                      <div className={`absolute bottom-2 right-2 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-lg backdrop-blur-md ${theme==='dark'?'bg-black/70 text-white':'bg-white/90 text-slate-800'}`}>
                        <span className="text-slate-400">{t('editor.output')}: </span>
                        <span className="text-[#1a73e8]">{estimatedSize()}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold max-w-[200px] truncate">{activeImage.name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{activeImage.width}×{activeImage.height}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{formatSize(activeImage.size)}</span>
                      </div>
                      <button onClick={()=>setIsCropping(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all">
                        <Crop className="w-3 h-3" /> {t('editor.crop')}
                      </button>
                    </div>
                  </>
                ):(<p className="text-slate-400 text-center">{t('editor.noImage')}</p>)}
              </div>
            </div>

            <div className={`w-full lg:w-[380px] p-6 border-t lg:border-t-0 lg:border-l flex flex-col gap-5 overflow-y-auto ${theme==='dark'?'bg-[#1e1f20] border-[#2d2f31]':'bg-white border-[#dadce0]'}`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/30">
                <h2 className="font-display font-bold text-lg">{t('editor.settings')}</h2>
                <div className="flex items-center gap-1">
                  <button onClick={undo} disabled={historyIdx<0}
                    className={`p-1.5 rounded-lg transition-all ${historyIdx<0?'opacity-30 cursor-not-allowed':'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'}`} title={t('editor.undo')}>
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={redo} disabled={historyIdx>=history.length-1}
                    className={`p-1.5 rounded-lg transition-all ${historyIdx>=history.length-1?'opacity-30 cursor-not-allowed':'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'}`} title={t('editor.redo')}>
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 block">{t('editor.dimensions')}</label>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                  <input type="number" min={1} value={width||''} onChange={e=>onW(parseInt(e.target.value)||1)}
                    className={`w-full text-center py-2.5 px-3 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-[#1a73e8] outline-none ${theme==='dark'?'bg-[#131314] border-[#3c4043] text-white':'bg-white border-[#dadce0]'}`} />
                  <button onClick={()=>setLockRatio(!lockRatio)}
                    className={`p-2.5 rounded-xl border transition-all ${lockRatio?'bg-[#1a73e8] text-white border-[#1a73e8]':theme==='dark'?'border-[#3c4043] text-slate-400':'border-[#dadce0] text-slate-600'}`}>
                    {lockRatio?<Lock className="w-4 h-4"/>:<Unlock className="w-4 h-4"/>}
                  </button>
                  <input type="number" min={1} value={height||''} onChange={e=>onH(parseInt(e.target.value)||1)}
                    className={`w-full text-center py-2.5 px-3 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-[#1a73e8] outline-none ${theme==='dark'?'bg-[#131314] border-[#3c4043] text-white':'bg-white border-[#dadce0]'}`} />
                </div>
                <select value={unit} onChange={e=>setUnit(e.target.value as any)}
                  className={`mt-2 w-full py-2 px-3 rounded-xl border text-xs font-semibold outline-none ${theme==='dark'?'bg-[#131314] border-[#3c4043] text-white':'bg-white border-[#dadce0]'}`}>
                  <option value="px">{t('units.pixels')}</option><option value="percent">{t('units.percent')}</option><option value="cm">{t('units.cm')}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 block">{t('editor.output')}</label>
                <div className="flex gap-2">
                  <select value={format} onChange={e=>setFormat(e.target.value as any)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold outline-none ${theme==='dark'?'bg-[#131314] border-[#3c4043] text-white':'bg-white border-[#dadce0]'}`}>
                    <option value="jpg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option>
                  </select>
                  {format!=='png'&&(
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${theme==='dark'?'bg-[#131314] border-[#3c4043]':'bg-white border-[#dadce0]'}`}>
                      <input type="range" min={10} max={100} value={quality} onChange={e=>setQuality(parseInt(e.target.value))} className="w-20 accent-[#1a73e8]" />
                      <span className="text-xs font-bold text-[#1a73e8] w-8 text-right">{quality}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400">{t('editor.bg')}:</span>
                  <div className="flex gap-1 items-center">
                    {['#ffffff','#000000','#1a73e8','#ff0000','#00a86b','#ffd700','#ff69b4','#8b5cf6'].map(c=>(
                      <button key={c} onClick={()=>setBgColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${bgColor===c?'border-[#1a73e8] scale-110':'border-transparent hover:scale-110'}`} style={{backgroundColor:c}} />
                    ))}
                    <label className={`w-5 h-5 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-[#1a73e8] ${!['#ffffff','#000000','#1a73e8','#ff0000','#00a86b','#ffd700','#ff69b4','#8b5cf6'].includes(bgColor)?'border-[#1a73e8]':''}`}
                      style={!['#ffffff','#000000','#1a73e8','#ff0000','#00a86b','#ffd700','#ff69b4','#8b5cf6'].includes(bgColor)?{backgroundColor:bgColor}:{}}>
                      <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="w-0 h-0 opacity-0 absolute" />
                      <span className="text-[8px] text-slate-400">+</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${smartCompress?'border-[#1a73e8]/30 bg-[#1a73e8]/5':theme==='dark'?'border-[#2d2f31]':'border-[#dadce0]'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Wand2 className={`w-4 h-4 ${smartCompress?'text-[#1a73e8]':'text-slate-400'}`} />
                    <span className="text-sm font-bold">{t('editor.smartCompress')}</span>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-all relative ${smartCompress?'bg-[#1a73e8]':'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${smartCompress?'translate-x-5':''}`} />
                    <input type="checkbox" checked={smartCompress} onChange={e=>setSmartCompress(e.target.checked)} className="sr-only" />
                  </div>
                </label>
                {smartCompress&&(
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">{t('editor.target')}:</span>
                    <input type="number" min={1} max={9999} value={targetKBInput} onChange={e=>setTargetKBInput(e.target.value)} onBlur={e=>{const p=parseInt(e.target.value);if(!isNaN(p)&&p>=1)setTargetKB(Math.min(9999,p));else setTargetKBInput(String(targetKB))}}
                      className={`w-20 text-center py-1.5 rounded-lg border text-xs font-bold outline-none focus:ring-2 focus:ring-[#1a73e8] ${theme==='dark'?'bg-[#131314] border-[#3c4043] text-white':'bg-white border-[#dadce0]'}`} />
                    <span className="text-xs font-semibold text-slate-400">KB</span>
                  </div>
                )}
              </div>

              <button onClick={startResize}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-[#1a73e8] to-[#1557b0] hover:from-[#1557b0] hover:to-[#1a73e8] text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all">
                <Zap className="w-5 h-5" />
                {t('editor.resize')} {images.length>1?`${t('editor.all')} ${images.length}`:''}
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20">⏎</kbd>
              </button>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#137333] dark:text-[#81c995] bg-[#e6f4ea] dark:bg-[#137333]/15 py-3 rounded-2xl">
                  <Shield className="w-4 h-4" />
                  <span>{t('editor.privacy')}</span>
                </div>
                <div className="flex justify-center gap-3 text-[10px] text-slate-400">
                  <span><kbd className="font-mono px-1 rounded bg-slate-100 dark:bg-slate-800">⌘Z</kbd> {t('editor.undo')}</span>
                  <span><kbd className="font-mono px-1 rounded bg-slate-100 dark:bg-slate-800">⇧⌘Z</kbd> {t('editor.redo')}</span>
                  <span><kbd className="font-mono px-1 rounded bg-slate-100 dark:bg-slate-800">⌘O</kbd> {t('nav.features')}</span>
                  <span><kbd className="font-mono px-1 rounded bg-slate-100 dark:bg-slate-800">Esc</kbd> {t('editor.back')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {page==='done'&&(
          <DownloadScreen theme={theme} results={results} activeImage={activeImage}
            activeResult={activeResult??null} sliderRef={sliderRef} sliderPos={sliderPos}
            handleMouseMove={(e:any)=>{if(e.buttons!==1)return;const r=sliderRef.current?.getBoundingClientRect();if(r)setSliderPos(Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100)))}}
            handleTouchMove={(e:any)=>{const r=sliderRef.current?.getBoundingClientRect();if(r)setSliderPos(Math.max(0,Math.min(100,((e.touches[0].clientX-r.left)/r.width)*100)))}}
            handleMouseDown={(e:any)=>{const r=sliderRef.current?.getBoundingClientRect();if(r)setSliderPos(Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100)))}}
            handleTouchStart={(e:any)=>{const r=sliderRef.current?.getBoundingClientRect();if(r)setSliderPos(Math.max(0,Math.min(100,((e.touches[0].clientX-r.left)/r.width)*100)))}}
            formatSize={formatSize} downloadSingleResult={downloadSingle}
            downloadAll={downloadAll} share={()=>navigator.clipboard.writeText('https://imgrunner.com').then(()=>notify(t('alerts.linkCopied')),()=>notify(t('alerts.copyFailed'),true))}
            copyLink={()=>navigator.clipboard.writeText('https://imgrunner.com').then(()=>notify(t('alerts.linkCopied')),()=>notify(t('alerts.copyFailed'),true))}
            resetAll={resetAll} t={t} onSelectResult={handleSelectResult} selectedResultId={selectedResultId} />
        )}
      </main>

      <ProcessingOverlay processing={processing} processingText={progressText} processingProgress={progress} t={t} />

      {isCropping&&activeImage&&(
        <ImageCropper imageUrl={activeImage.url} imageName={activeImage.name}
          theme={theme} onCropSave={handleCropSave} onClose={()=>setIsCropping(false)} t={t} lang={lang} />
      )}

      <Footer theme={theme} t={t} />
    </div>
  );
}